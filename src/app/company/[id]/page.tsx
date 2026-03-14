"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams } from "next/navigation";
import Link from "next/link";

interface OppDetail {
  title: string;
  validationChecklist?: string;
  requirements?: string;
  highLevelApproach?: string;
  fullPlaybook?: string;
  templates?: string;
  watermark?: string;
  watermark2?: string;
  hasStage1: boolean;
  hasStage2: boolean;
  stage2Price: number;
}

interface MessageItem {
  id: string;
  content: string;
  createdAt: string;
  sender: { name: string; role: string };
}

interface MeetingItem {
  id: string;
  proposedTimes: string;
  confirmedTime: string | null;
  status: string;
  contributor: { name: string };
}

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
}

function StarPicker({
  rating,
  onSelect,
}: {
  rating: number;
  onSelect: (r: number) => void;
}) {
  const [hover, setHover] = useState(0);
  return (
    <span className="inline-flex gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          className={`text-2xl transition-colors ${
            i <= (hover || rating) ? "text-yellow-400" : "text-slate-300"
          } hover:text-yellow-400`}
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onSelect(i)}
        >
          &#9733;
        </button>
      ))}
    </span>
  );
}

export default function CompanyOpportunityPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [opp, setOpp] = useState<OppDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [proposedTimes, setProposedTimes] = useState("");
  const [loading, setLoading] = useState(true);

  // Review form state
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [existingReview, setExistingReview] = useState<ExistingReview | null>(
    null
  );
  const [reviewSaving, setReviewSaving] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState("");
  const [reviewError, setReviewError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/opportunities/${id}`).then((r) => r.json()),
      fetch(`/api/messages?opportunityId=${id}`).then((r) =>
        r.json().catch(() => [])
      ),
      fetch(`/api/meetings`).then((r) => r.json()),
      fetch(`/api/reviews?opportunityId=${id}`).then((r) => r.json()),
    ]).then(([oppData, msgData, meetingData, reviewsData]) => {
      setOpp(oppData);
      setMessages(Array.isArray(msgData) ? msgData : []);
      setMeetings(
        Array.isArray(meetingData)
          ? meetingData.filter(
              (m: { opportunity: { id: string } }) =>
                m.opportunity.id === id
            )
          : []
      );

      // Check if current user already has a review
      if (session?.user?.id && Array.isArray(reviewsData)) {
        const myReview = reviewsData.find(
          (r: { companyId?: string; company?: { name: string } }) => {
            // The review API returns company.name, so we match by name
            // But better to check from the opportunity detail response
            return false; // Will load from separate endpoint
          }
        );
        if (myReview) {
          setExistingReview(myReview);
          setReviewRating(myReview.rating);
          setReviewComment(myReview.comment || "");
        }
      }

      setLoading(false);
    });
  }, [id, session]);

  // Load existing review for this user
  useEffect(() => {
    if (!session?.user?.id || !id) return;
    fetch(`/api/reviews?opportunityId=${id}`)
      .then((r) => r.json())
      .then((reviews) => {
        if (Array.isArray(reviews)) {
          // Match by company name since we don't get companyId in the response
          const userName = session.user?.name;
          const myReview = reviews.find(
            (r: { company: { name: string } }) => r.company.name === userName
          );
          if (myReview) {
            setExistingReview(myReview);
            setReviewRating(myReview.rating);
            setReviewComment(myReview.comment || "");
          }
        }
      });
  }, [id, session]);

  async function sendMessage() {
    if (!newMessage.trim()) return;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id, content: newMessage }),
    });
    if (res.ok) {
      const msg = await res.json();
      setMessages([...messages, msg]);
      setNewMessage("");
    }
  }

  async function requestMeeting() {
    if (!proposedTimes.trim()) return;
    const times = proposedTimes.split(",").map((t) => t.trim());
    const res = await fetch("/api/meetings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ opportunityId: id, proposedTimes: times }),
    });
    if (res.ok) {
      const meeting = await res.json();
      setMeetings([meeting, ...meetings]);
      setProposedTimes("");
    }
  }

  async function submitReview() {
    if (reviewRating === 0) {
      setReviewError("Please select a rating");
      return;
    }
    setReviewSaving(true);
    setReviewError("");
    setReviewSuccess("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        opportunityId: id,
        rating: reviewRating,
        comment: reviewComment,
      }),
    });

    if (res.ok) {
      const review = await res.json();
      setExistingReview(review);
      setReviewSuccess(
        existingReview ? "Review updated!" : "Review submitted!"
      );
    } else {
      const data = await res.json();
      setReviewError(data.error || "Failed to submit review");
    }
    setReviewSaving(false);
  }

  if (loading) return <p className="text-slate-500">Loading...</p>;
  if (!opp) return <p className="text-red-600">Not found.</p>;

  const hasStage1 = opp.hasStage1;
  const hasStage2 = opp.hasStage2;
  const hasPurchase = hasStage1 || hasStage2;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/company" className="text-emerald-600 text-sm hover:underline">
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">
        {opp.title}
      </h1>

      {/* Stage 1 content */}
      {opp.validationChecklist && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          {opp.watermark && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mb-4">
              {opp.watermark}
            </div>
          )}
          <h2 className="font-semibold text-slate-800 mb-3">
            Stage 1 — Unlocked
          </h2>
          <div className="space-y-3 text-sm text-slate-600">
            <div>
              <h3 className="font-medium text-slate-700">Validation Checklist</h3>
              <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded mt-1">
                {opp.validationChecklist}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-700">Requirements</h3>
              <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded mt-1">
                {opp.requirements}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-slate-700">High-Level Approach</h3>
              <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded mt-1">
                {opp.highLevelApproach}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2 content */}
      {opp.fullPlaybook && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          {opp.watermark2 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mb-4">
              {opp.watermark2}
            </div>
          )}
          <h2 className="font-semibold text-slate-800 mb-3">
            Stage 2 — Full Playbook
          </h2>
          <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded text-sm text-slate-600">
            {opp.fullPlaybook}
          </div>
          {opp.templates && (
            <div className="mt-3">
              <h3 className="font-medium text-slate-700 text-sm">Templates</h3>
              <div className="whitespace-pre-wrap bg-slate-50 p-3 rounded text-sm text-slate-600 mt-1">
                {opp.templates}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Review Form (visible if company has any purchase) */}
      {hasPurchase && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">
            {existingReview ? "Your Review" : "Leave a Review"}
          </h2>

          {reviewSuccess && (
            <div className="bg-green-50 text-green-700 px-4 py-2 rounded-lg mb-3 text-sm">
              {reviewSuccess}
            </div>
          )}
          {reviewError && (
            <div className="bg-red-50 text-red-700 px-4 py-2 rounded-lg mb-3 text-sm">
              {reviewError}
            </div>
          )}

          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Rating
            </label>
            <StarPicker rating={reviewRating} onSelect={setReviewRating} />
          </div>

          <div className="mb-3">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Comment (optional)
            </label>
            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              rows={3}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
              placeholder="Share your experience with this opportunity..."
            />
          </div>

          <button
            onClick={submitReview}
            disabled={reviewSaving || reviewRating === 0}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800 disabled:opacity-50"
          >
            {reviewSaving
              ? "Submitting..."
              : existingReview
                ? "Update Review"
                : "Submit Review"}
          </button>
        </div>
      )}

      {/* Messaging (Stage 2 only) */}
      {hasStage2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-slate-800 mb-3">Messages</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-sm text-slate-400">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.sender.role === "company"
                      ? "bg-blue-50 text-blue-900 ml-8"
                      : "bg-slate-50 text-slate-800 mr-8"
                  }`}
                >
                  <div className="font-medium text-xs mb-1">
                    {msg.sender.name}{" "}
                    <span className="text-slate-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {msg.content}
                </div>
              ))
            )}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Meeting requests (Stage 2 only) */}
      {hasStage2 && (
        <div className="bg-white border border-slate-200 rounded-xl p-6">
          <h2 className="font-semibold text-slate-800 mb-3">Meetings</h2>

          {meetings.map((m) => (
            <div
              key={m.id}
              className="border border-slate-100 rounded-lg p-3 mb-3 text-sm"
            >
              <div className="flex justify-between">
                <span className="font-medium">
                  Meeting with {m.contributor.name}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-xs ${
                    m.status === "confirmed"
                      ? "bg-green-100 text-green-700"
                      : m.status === "completed"
                        ? "bg-slate-100 text-slate-600"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              {m.confirmedTime && (
                <p className="text-xs text-slate-500 mt-1">
                  Confirmed: {m.confirmedTime}
                </p>
              )}
              {!m.confirmedTime && (
                <p className="text-xs text-slate-500 mt-1">
                  Proposed: {JSON.parse(m.proposedTimes).join(", ")}
                </p>
              )}
            </div>
          ))}

          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Request a Meeting
            </label>
            <input
              type="text"
              value={proposedTimes}
              onChange={(e) => setProposedTimes(e.target.value)}
              placeholder="Enter proposed times, comma-separated (e.g. Mon 2pm, Tue 10am)"
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm mb-2"
            />
            <button
              onClick={requestMeeting}
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-green-700"
            >
              Send Meeting Request
            </button>
          </div>
        </div>
      )}

      {/* Stage 2 not purchased */}
      {!hasStage2 && opp.stage2Price > 0 && session && (
        <div className="bg-slate-50 border border-dashed border-slate-300 rounded-lg p-8 text-center">
          <p className="text-slate-500 mb-2">
            Unlock Stage 2 to access the full playbook, messaging, and meeting
            requests.
          </p>
          <Link
            href={`/opportunity/${id}`}
            className="text-emerald-600 underline text-sm"
          >
            Go to opportunity page to purchase
          </Link>
        </div>
      )}
    </div>
  );
}
