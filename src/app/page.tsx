"use client";

import { useState, useEffect, useCallback } from "react";

// Affiliation lists for D1 and D2
const D1_AFFILIATIONS = [
  "IARE", "GRIET", "CMRCET", "NMIMS", "KMIT", "CBIT", "LORDS", "MAHINDRA", "ST ANNS", "TKR", "SMEC", "VARDHAMAN",
  "WATER PROJECT", "HYA", "GNITS", "STANLEY", "VASAVI", "JNAFAU", "JOSEPHS", "MLRITM", "OBS", "MRW", "BIET", "VBIT",
  "I&R", "FRANCIS", "GCET", "VJIT", "CMRIT", "MVSR", "MCET", "SCET", "GNI", "KG REDDY", "CMREC", "MECS", "PAW",
  "ST MARY'S", "BHAVANS", "NNRG", "GITAM", "CVR", "NMREC", "BADRUKA", "SVIT", "HITAM", "PRIDE", "VNRVJIET", "AVINASH",
  "AURORA UNIVERSITY", "ST PIOUS", "SNIST", "SREYAS", "VVSB", "MALLAREDDY UNIVERSITY", "EFORCE", "ICFAI", "JNTU", "MGIT",
  "CARE", "KLU", "MREC", "AMITY", "ANURAG", "CMRTC", "BVRIT", "ROOTS", "WOXSEN", "NGIT", "ORIGINATE", "HCU", "GOLD",
  "VEC", "KU", "VDC", "KITSW", "MASTERJI", "AVINASH", "SRU", "SRITW", "NITW", "ARTS & SCIENCE COLLEGE", "KITS-SINGAPUR",
  "SVS", "NEW SCIENCE", "BITS", "JAYAMUKHI", "TALLA PADMAVATHI"
];

const D2_AFFILIATIONS = [
  "IARE", "GRIET", "CMRCET", "NMIMS", "KMIT", "CBIT", "LORDS", "MAHINDRA", "ST ANNS", "TKR", "SMEC", "VARDHAMAN",
  "WATER PROJECT", "HYA", "GNITS", "STANLEY", "VASAVI", "JNAFAU", "JOSEPHS", "MLRITM", "OBS", "MRW", "BIET", "VBIT",
  "I&R", "FRANCIS", "GCET", "VJIT", "CMRIT", "MVSR", "MCET", "SCET", "GNI", "KG REDDY", "CMREC", "MECS", "PAW",
  "ST MARY'S", "BHAVANS", "NNRG", "GITAM", "CVR", "NMREC", "BADRUKA", "SVIT", "HITAM", "PRIDE", "VNRVJIET", "AVINASH",
  "AURORA UNIVERSITY", "ST PIOUS", "SNIST", "SREYAS", "VVSB", "MALLAREDDY UNIVERSITY", "EFORCE", "ICFAI", "JNTU", "MGIT",
  "CARE", "KLU", "MREC", "AMITY", "ANURAG", "CMRTC", "BVRIT", "ROOTS", "WOXSEN", "NGIT", "ORIGINATE", "HCU", "GOLD",
  "VEC", "KU", "VDC", "KITSW", "MASTERJI", "AVINASH", "SRU", "SRITW", "NITW", "ARTS & SCIENCE COLLEGE", "KITS-SINGAPUR",
  "SVS", "NEW SCIENCE", "BITS", "JAYAMUKHI", "TALLA PADMAVATHI"
];

type L1RegistrationPayload = {
  name: string;
  phone: string;
  email: string;
  affiliation: string;
  roleName: string;
  l2MemberId: number;
  l2MemberType: "D1" | "D2";
};

type L2Member = {
  id: number;
  name: string;
  phone: string;
  email: string;
  affiliation: string;
  uniqueDandiyaId: string;
  createdAt: string;
  updatedAt: string;
};

type L4Member = {
  id: number;
  name: string;
  email: string;
  phone: string;
  uniqueDandiyaId: string;
  createdAt: string;
  updatedAt: string;
  l2Members: L2Member[];
  l2MembersCount: number;
};

type ApiResponse = {
  success: boolean;
  message: string;
  data: {
    l4Members: L4Member[];
    totalL4Members: number;
    totalL2Members: number;
  };
  meta: {
    timestamp: string;
    count: number;
  };
};

type RegistrationSuccessResponse = {
  success: boolean;
  message: string;
  data: {
    id: number;
    name: string;
    phone: string;
    email: string;
    affiliation: string;
    roleName: string;
    uniqueDandiyaId: string;
    createdAt: string;
    updatedAt: string;
    d1L2MemberId: number | null;
    d2L2MemberId: number | null;
    d1L2Member: {
      id: number;
      name: string;
      uniqueDandiyaId: string;
      affiliation: string;
    } | null;
    d2L2Member: null;
  };
  meta: {
    timestamp: string;
  };
};

export default function Home() {
  const [formData, setFormData] = useState<L1RegistrationPayload>({
    name: "",
    phone: "",
    email: "",
    affiliation: "",
    roleName: "Event Coordinator",
    l2MemberId: 5,
    l2MemberType: "D1",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<
    RegistrationSuccessResponse["data"] | null
  >(null);

  // API data and selection states
  const [l4Members, setL4Members] = useState<L4Member[]>([]);
  const [selectedL4Member, setSelectedL4Member] = useState<L4Member | null>(
    null
  );
  const [selectedL2Member, setSelectedL2Member] = useState<L2Member | null>(
    null
  );
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);

  const resetForm = () => {
    setIsSuccess(false);
    setError(null);
    setSuccessData(null);
    setSelectedL4Member(null);
    setSelectedL2Member(null);
    setFormData({
      name: "",
      phone: "",
      email: "",
      affiliation: "",
      roleName: "Event Coordinator",
      l2MemberId: 5,
      l2MemberType: "D1",
    });
  };

  function getErrorMessage(err: unknown): string {
    if (err instanceof Error) return err.message;
    if (typeof err === "string") return err;
    return "Something went wrong";
  }

  const fetchMembers = useCallback(async (type: "D1" | "D2") => {
    setIsLoadingMembers(true);
    setError(null);
    try {
      const response = await fetch(
        `https://scpapi.elitceler.com/api/v1/${type.toLowerCase()}/l4-members`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch ${type} members`);
      }

      const data: ApiResponse = await response.json();
      setL4Members(data.data.l4Members);
      setSelectedL4Member(null);
      setSelectedL2Member(null);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
      setL4Members([]);
    } finally {
      setIsLoadingMembers(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers(formData.l2MemberType);
  }, [formData.l2MemberType, fetchMembers]);

  useEffect(() => {
    if (selectedL2Member) {
      setFormData((prev) => ({
        ...prev,
        l2MemberId: selectedL2Member.id,
      }));
    }
  }, [selectedL2Member]);

  // Clear affiliation when switching between D1 and D2
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      affiliation: "",
    }));
  }, [formData.l2MemberType]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Validate that an L2 member is selected
    if (!selectedL2Member) {
      setError("Please select an L2 member before submitting.");
      setIsSubmitting(false);
      return;
    }

    try {
      const payload: L1RegistrationPayload = {
        ...formData,
        l2MemberId: selectedL2Member.id,
      };

      const response = await fetch(
        "https://scpapi.elitceler.com/api/v1/l1-members/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data: RegistrationSuccessResponse = await response.json();

      if (!response.ok) {
        let message = "Request failed";
        if (data && typeof data === "object" && "message" in data) {
          message = data.message;
        }
        throw new Error(message);
      }

      setSuccessData(data.data);
      setIsSuccess(true);
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center p-6 text-white"
      style={{
        background: "linear-gradient(180deg, #297AE0 0%, #0054BE 100%)",
      }}
    >
      <div className="w-full max-w-md bg-white rounded-lg p-6 shadow-xl text-gray-900">
        {isSuccess ? (
          <div className="text-center py-8">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-2xl">
              ✓
            </div>
            <h1 className="text-2xl font-semibold mb-2">Success</h1>
            <p className="text-gray-700 mb-4">
              Your registration has been submitted successfully.
            </p>
            {successData && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h2 className="text-lg font-medium text-blue-900 mb-2">
                  Your L1 ID
                </h2>
                <p className="text-2xl font-bold text-blue-600 font-mono">
                  {successData.uniqueDandiyaId}
                </p>
              </div>
            )}
            <button
              onClick={resetForm}
              className="w-full text-white rounded-md px-4 py-2 bg-gradient-to-r from-[#297AE0] to-[#0054BE] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-white"
            >
              Register Another L1 Member
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-2xl font-semibold mb-4">L1 Registration</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="name"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="phone"
                >
                  Phone number
                </label>
                <input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  placeholder="9876543210"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="email"
                >
                  Mail id
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  placeholder="john.doe@example.com"
                />
              </div>

              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="affiliation"
                >
                  Affiliation name
                </label>
                <select
                  id="affiliation"
                  required
                  value={formData.affiliation}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      affiliation: e.target.value,
                    }))
                  }
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                >
                  <option value="">Select an affiliation...</option>
                  {(formData.l2MemberType === "D1" ? D1_AFFILIATIONS : D2_AFFILIATIONS).map((affiliation) => (
                    <option key={affiliation} value={affiliation}>
                      {affiliation}
                    </option>
                  ))}
                </select>
              </div>

              {/* roleName is fixed in payload; hidden from user */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700"
                    htmlFor="l2MemberType"
                  >
                    Select L2 Member Type
                  </label>
                  <select
                    id="l2MemberType"
                    value={formData.l2MemberType}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        l2MemberType: e.target.value as "D1" | "D2",
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  >
                    <option value="D1">D1 - Navratri Nirvana</option>
                    <option value="D2">D2 - Navratri Mahotsav</option>
                  </select>
                </div>
              </div>

              {/* L4 Member Selection */}
              <div>
                <label
                  className="block text-sm font-medium mb-1 text-gray-700"
                  htmlFor="l4Member"
                >
                  Select L4 Member
                </label>
                {isLoadingMembers ? (
                  <div className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500">
                    Loading members...
                  </div>
                ) : (
                  <select
                    id="l4Member"
                    value={selectedL4Member?.id || ""}
                    onChange={(e) => {
                      const memberId = parseInt(e.target.value);
                      const member = l4Members.find((m) => m.id === memberId);
                      setSelectedL4Member(member || null);
                      setSelectedL2Member(null);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  >
                    <option value="">Select an L4 member...</option>
                    {l4Members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.uniqueDandiyaId}) -{" "}
                        {member.l2MembersCount} L2 members
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* L2 Member Selection */}
              {selectedL4Member && selectedL4Member.l2Members.length > 0 && (
                <div>
                  <label
                    className="block text-sm font-medium mb-1 text-gray-700"
                    htmlFor="l2Member"
                  >
                    Select L2 Member
                  </label>
                  <select
                    id="l2Member"
                    value={selectedL2Member?.id || ""}
                    onChange={(e) => {
                      const memberId = parseInt(e.target.value);
                      const member = selectedL4Member.l2Members.find(
                        (m) => m.id === memberId
                      );
                      setSelectedL2Member(member || null);
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#297AE0] focus:border-transparent"
                  >
                    <option value="">Select an L2 member...</option>
                    {selectedL4Member.l2Members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.name} ({member.affiliation}) -{" "}
                        {member.uniqueDandiyaId}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white rounded-md px-4 py-2 disabled:opacity-60 bg-gradient-to-r from-[#297AE0] to-[#0054BE] shadow-sm hover:shadow focus:outline-none focus:ring-2 focus:ring-white"
              >
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </form>

            {error && <div className="mt-4 text-red-600 text-sm">{error}</div>}
          </>
        )}
      </div>
    </div>
  );
}
