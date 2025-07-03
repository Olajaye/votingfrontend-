import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import io, { Socket } from "socket.io-client";
import { v4 as uuidv4 } from "uuid";
import { RoomType, Option } from "../types";
import Countdown from "react-countdown";
import { API_BASE_URL, AuthContext } from "../Context/AuthContext"; // Assuming you have an auth context
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const socket: Socket = io("http://localhost:5000");

const RoomsList: React.FC = () => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<RoomType | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [deviceId, setDeviceId] = useState<string>("");
  const authContext = useContext(AuthContext);
  const user = authContext?.user; // Get user from AuthContext
  const [randomUUID, setRandomUUI] = useState("");
  const navigate = useNavigate();

  const logout = authContext?.logout;

  useEffect(() => {
    if (!user) {
      setDeviceId(uuidv4());
    }
  }, []);

  useEffect(() => {
    // Generate a device ID if user isn't logged in

    const fetchRooms = async () => {
      try {
        setIsLoading(true);
        const res = await axios.get<RoomType[]>(
          `${API_BASE_URL}/rooms`
        );
        setRooms(res.data);
        setError("");
      } catch (err) {
        console.error(err);
        setError("Failed to load rooms. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();

    socket.on("voteUpdate", (updatedRoom: RoomType) => {
      setRooms((prev) =>
        prev.map((room) => (room.id === updatedRoom.id ? updatedRoom : room))
      );
    });

    return () => {
      socket.off("voteUpdate");
    };
  }, [randomUUID]);

  const handleRoomClick = (room: RoomType) => {
    setSelectedRoom(room);
    setShowVoteModal(true);
  };

  const handelLogout = () => {
    logout && logout();
    navigate("/");
  };

  const handleVote = async () => {
    if (!selectedOption || !selectedRoom) return;

    try {
      setIsLoading(true);
      await axios.post(
        `${API_BASE_URL}/rooms/${selectedRoom.uniqueId}/vote`,
        {
          optionId: selectedOption,
          guestsId: user ? null : deviceId,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user?.token}`, // Add Bearer token
          },
        }
      );
      setShowVoteModal(false);
      setSelectedOption(null);
      setRandomUUI(uuidv4());
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to submit vote");
    } finally {
      setIsLoading(false);
    }
  };

  const calculatePercentage = (votes: number, totalVotes: number) => {
    if (totalVotes === 0) return 0;
    return Math.round((votes / totalVotes) * 100);
  };


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <>
        <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8">
          <div
            className="absolute inset-0 bg-[url('/Lagos_Seal.png')] opacity-15 bg-repeat"
            aria-hidden="true"
          ></div>

          <div
            className="absolute inset-0 bg-black opacity-5"
            aria-hidden="true"
          ></div>

          <div className="relative z-10 text-black">
            {" "}
            <div className="min-h-screen flex items-center justify-center  p-4">
              <div className="max-w-md w-full mx-auto bg-white rounded-xl shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-3xl">
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-center">
                  <div className="flex justify-center">
                    <svg
                      className="h-12 w-12 text-white animate-bounce"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <h2 className="mt-2 text-xl font-bold text-white">
                    Oops! Something went wrong
                  </h2>
                </div>

                <div className="p-6">
                  <div className="text-center">
                    <p className="text-gray-700 mb-6">{error}</p>

                    <div className="mb-6">
                      <svg
                        className="w-full h-12 text-gray-300 animate-pulse"
                        viewBox="0 0 100 10"
                        preserveAspectRatio="none"
                      >
                        <path
                          d="M0,5 L20,5 L25,0 L30,5 L50,5 L55,10 L60,5 L100,5"
                          stroke="currentColor"
                          strokeWidth="1"
                          fill="none"
                        />
                      </svg>
                    </div>

                    <div className="flex space-x-4 justify-center">
                      <button
                        onClick={() => setError("")}
                        className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Try Again
                      </button>

                      <Link
                        to="/"
                        className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 flex items-center"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                          />
                        </svg>
                        Go Home
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-4 text-center">
                  <p className="text-sm text-gray-500">
                    Need help?{" "}
                    <a href="#" className="text-indigo-600 hover:underline">
                      Contact support
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="relative min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div
        className="absolute inset-0 bg-[url('/Lagos_Seal.png')] opacity-15 bg-repeat"
        aria-hidden="true"
      ></div>

      <div
        className="absolute inset-0 bg-black opacity-5"
        aria-hidden="true"
      ></div>

      <div className="relative z-10 text-black">
        <div className="py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Voting Rooms</h1>

              <div>
                <Link
                  to={"/create-room"}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                >
                  Create New Room
                </Link>

                <button
                  onClick={handelLogout}
                  className="px-4 py-2 ms-4 bg-red-500 text-white rounded-md hover:bg-red-900"
                >
                  Log Out
                </button>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map((room) => {
                const totalVotes = room.options.reduce(
                  (sum, option) => sum + option.voteCount,
                  0
                );
                const isClosed = new Date() > new Date(room.deadline);

                return (
                  <div
                    key={room.id}
                    className="bg-white shadow rounded-lg overflow-hidden"
                  >
                    <div className="px-4 py-5 sm:p-6">
                      <h3 className="text-lg font-medium text-gray-900">
                        {room.title}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {room.description}
                      </p>

                      <div className="mt-4 flex items-center text-sm text-gray-500">
                        <svg
                          className="flex-shrink-0 mr-1.5 h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {isClosed ? (
                          "Closed"
                        ) : (
                          <Countdown date={room.deadline} />
                        )}
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Total votes:</span>
                          <span>{totalVotes}</span>
                        </div>
                        {room.options
                          .sort((a, b) => b.voteCount - a.voteCount)
                          .slice(0, 3)
                          .map((option) => (
                            <div key={option.id} className="mb-1">
                              <div className="flex justify-between text-base mb-3">
                                <span className="truncate">{option.text}</span>
                                <span>{option.voteCount}</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div
                                  className="bg-indigo-600 h-1.5 rounded-full"
                                  style={{
                                    width: `${calculatePercentage(
                                      option.voteCount,
                                      totalVotes
                                    )}%`,
                                  }}
                                ></div>
                              </div>
                            </div>
                          ))}
                      </div>

                      <button
                        onClick={() => handleRoomClick(room)}
                        disabled={isClosed}
                        className={`mt-4 w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                          isClosed
                            ? "bg-gray-400 cursor-not-allowed"
                            : "bg-indigo-600 hover:bg-indigo-700"
                        } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                      >
                        {isClosed ? "View Results" : "Vote Now"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Vote Modal */}
            {showVoteModal && selectedRoom && (
              <>
                <div className="fixed inset-0  min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8 z-50">
                  <div
                    className="absolute inset-0 bg-[url('/Lagos_Seal.png')] opacity-15 bg-repeat"
                    aria-hidden="true"
                  ></div>

                  <div
                    className="absolute inset-0 bg-black opacity-5"
                    aria-hidden="true"
                  ></div>

                  <div className="relative flex justify-center items-center min-h-screen z-10 text-black">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                      <div className="p-6">
                        <div className="flex justify-between items-start">
                          <h3 className="text-lg font-medium text-gray-900">
                            {selectedRoom.title}
                          </h3>
                          <button
                            onClick={() => {
                              setShowVoteModal(false);
                              setSelectedOption(null);
                            }}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <svg
                              className="h-6 w-6"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>

                        <p className="mt-1 text-sm text-gray-500">
                          {selectedRoom.description}
                        </p>

                        <div className="mt-4 space-y-2">
                          {selectedRoom.options.map((option) => (
                            <div
                              key={option.id}
                              className={`p-3 border rounded-lg cursor-pointer ${
                                selectedOption === option.id
                                  ? "border-indigo-500 bg-indigo-50"
                                  : "border-gray-200"
                              }`}
                              onClick={() => setSelectedOption(option.id)}
                            >
                              <div className="flex items-center">
                                <div
                                  className={`w-5 h-5 rounded-full border flex items-center justify-center mr-3 ${
                                    selectedOption === option.id
                                      ? "bg-indigo-500 border-indigo-500"
                                      : "border-gray-300"
                                  }`}
                                >
                                  {selectedOption === option.id && (
                                    <svg
                                      className="w-3 h-3 text-white"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path
                                        fillRule="evenodd"
                                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                        clipRule="evenodd"
                                      />
                                    </svg>
                                  )}
                                </div>
                                <span>{option.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-6">
                          {!user && (
                            <p className="text-xs text-gray-500 mb-2">
                              Note: You're voting as a guest. Your vote will be
                              tied to this device.
                            </p>
                          )}
                          <button
                            onClick={handleVote}
                            disabled={!selectedOption || isLoading}
                            className={`w-full py-2 px-4 bg-indigo-600 text-white rounded-md ${
                              !selectedOption || isLoading
                                ? "opacity-50 cursor-not-allowed"
                                : "hover:bg-indigo-700"
                            }`}
                          >
                            {isLoading ? "Submitting..." : "Submit Vote"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <ToastContainer
                  position="top-right"
                  autoClose={5000}
                  hideProgressBar={false}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss
                  draggable
                  pauseOnHover
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomsList;
