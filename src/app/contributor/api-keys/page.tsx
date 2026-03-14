"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ApiKeyDisplay {
  id: string;
  keyPrefix: string;
  name: string;
  revoked: boolean;
  createdAt: string;
}

export default function ApiKeysPage() {
  const { data: session } = useSession();
  const [keys, setKeys] = useState<ApiKeyDisplay[]>([]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/api-keys")
      .then((r) => r.json())
      .then((data) => {
        setKeys(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  async function createKey() {
    const res = await fetch("/api/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newKeyName || "Default" }),
    });
    const data = await res.json();
    if (res.ok) {
      setNewKeyValue(data.key);
      setNewKeyName("");
      // Refresh list
      const keysRes = await fetch("/api/api-keys");
      setKeys(await keysRes.json());
    }
  }

  async function revokeKey(id: string) {
    await fetch("/api/api-keys", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setKeys(keys.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
  }

  if (!session) return <p>Please sign in.</p>;

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">API Keys</h1>
      <p className="text-slate-600 text-sm mb-6">
        Use API keys to let AI agents submit opportunities on your behalf. Send
        requests to <code className="bg-slate-100 px-1 rounded">POST /api/agent/submit</code>{" "}
        with your key in the <code className="bg-slate-100 px-1 rounded">Authorization: Bearer &lt;key&gt;</code>{" "}
        header.
      </p>

      {/* Create new key */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 mb-6">
        <h2 className="font-semibold text-slate-800 mb-3">Create New Key</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={newKeyName}
            onChange={(e) => setNewKeyName(e.target.value)}
            placeholder="Key name (e.g. My Agent)"
            className="flex-1 border border-slate-300 rounded-lg px-3 py-2 text-sm"
          />
          <button
            onClick={createKey}
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-800"
          >
            Generate
          </button>
        </div>
        {newKeyValue && (
          <div className="mt-4 bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <p className="text-sm font-medium text-yellow-800 mb-1">
              Save this key now — you won&apos;t see it again!
            </p>
            <code className="text-sm text-yellow-900 break-all">
              {newKeyValue}
            </code>
          </div>
        )}
      </div>

      {/* Key list */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <h2 className="font-semibold text-slate-800 mb-3">Your Keys</h2>
        {loading ? (
          <p className="text-slate-500 text-sm">Loading...</p>
        ) : keys.length === 0 ? (
          <p className="text-slate-500 text-sm">No API keys yet.</p>
        ) : (
          <div className="space-y-3">
            {keys.map((key) => (
              <div
                key={key.id}
                className="flex items-center justify-between border border-slate-100 rounded-lg p-3"
              >
                <div>
                  <span className="font-medium text-slate-800 text-sm">
                    {key.name}
                  </span>
                  <span className="text-xs text-slate-400 ml-2">
                    {key.keyPrefix}...
                  </span>
                  {key.revoked && (
                    <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">
                      Revoked
                    </span>
                  )}
                </div>
                {!key.revoked && (
                  <button
                    onClick={() => revokeKey(key.id)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
