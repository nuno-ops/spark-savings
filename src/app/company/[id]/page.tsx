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

export default function CompanyOpportunityPage() {
  const { id } = useParams();
  const { data: session } = useSession();
  const [opp, setOpp] = useState<OppDetail | null>(null);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [meetings, setMeetings] = useState<MeetingItem[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [proposedTimes, setProposedTimes] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`/api/opportunities/${id}`).then((r) => r.json()),
      fetch(`/api/messages?opportunityId=${id}`).then((r) =>
        r.json().catch(() => [])
      ),
      fetch(`/api/meetings`).then((r) => r.json()),
    ]).then(([oppData, msgData, meetingData]) => {
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
      setLoading(false);
    });
  }, [id]);

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

  if (loading) return <p className="text-gray-500">Loading...</p>;
  if (!opp) return <p className="text-red-600">Not found.</p>;

  const hasStage2 = opp.hasStage2;

  return (
    <div className="max-w-3xl mx-auto">
      <Link href="/company" className="text-indigo-600 text-sm hover:underline">
        &larr; Back to dashboard
      </Link>

      <h1 className="text-2xl font-bold text-gray-900 mt-4 mb-2">
        {opp.title}
      </h1>

      {/* Stage 1 content */}
      {opp.validationChecklist && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          {opp.watermark && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mb-4">
              {opp.watermark}
            </div>
          )}
          <h2 className="font-semibold text-gray-800 mb-3">
            Stage 1 — Unlocked
          </h2>
          <div className="space-y-3 text-sm text-gray-600">
            <div>
              <h3 className="font-medium text-gray-700">Validation Checklist</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-1">
                {opp.validationChecklist}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">Requirements</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-1">
                {opp.requirements}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-700">High-Level Approach</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded mt-1">
                {opp.highLevelApproach}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Stage 2 content */}
      {opp.fullPlaybook && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          {opp.watermark2 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs px-3 py-2 rounded mb-4">
              {opp.watermark2}
            </div>
          )}
          <h2 className="font-semibold text-gray-800 mb-3">
            Stage 2 — Full Playbook
          </h2>
          <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm text-gray-600">
            {opp.fullPlaybook}
          </div>
          {opp.templates && (
            <div className="mt-3">
              <h3 className="font-medium text-gray-700 text-sm">Templates</h3>
              <div className="whitespace-pre-wrap bg-gray-50 p-3 rounded text-sm text-gray-600 mt-1">
                {opp.templates}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Messaging (Stage 2 only) */}
      {hasStage2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-gray-800 mb-3">Messages</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <p className="text-sm text-gray-400">No messages yet.</p>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg text-sm ${
                    msg.sender.role === "company"
                      ? "bg-blue-50 text-blue-900 ml-8"
                      : "bg-gray-50 text-gray-800 mr-8"
                  }`}
                >
                  <div className="font-medium text-xs mb-1">
                    {msg.sender.name}{" "}
                    <span className="text-gray-400">
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
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm"
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Meeting requests (Stage 2 only) */}
      {hasStage2 && (
        <div className="bg-white border border-gray-200 rounded-xl p-6">
          <h2 className="font-semibold text-gray-800 mb-3">Meetings</h2>

          {meetings.map((m) => (
            <div
              key={m.id}
              className="border border-gray-100 rounded-lg p-3 mb-3 text-sm"
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
                        ? "bg-gray-100 text-gray-600"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {m.status}
                </span>
              </div>
              {m.confirmedTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Confirmed: {m.confirmedTime}
                </p>
              )}
              {!m.confirmedTime && (
                <p className="text-xs text-gray-500 mt-1">
                  Proposed: {JSON.parse(m.proposedTimes).join(", ")}
                </p>
              )}
            </div>
          ))}

          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Request a Meeting
            </label>
            <input
              type="text"
              value={proposedTimes}
              onChange={(e) => setProposedTimes(e.target.value)}
              placeholder="Enter proposed times, comma-separated (e.g. Mon 2pm, Tue 10am)"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm mb-2"
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
        <div className="bg-gray-50 border border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-500 mb-2">
            Unlock Stage 2 to access the full playbook, messaging, and meeting
            requests.
          </p>
          <Link
            href={`/opportunity/${id}`}
            className="text-indigo-600 underline text-sm"
          >
            Go to opportunity page to purchase
          </Link>
        </div>
      )}
    </div>
  );
}
