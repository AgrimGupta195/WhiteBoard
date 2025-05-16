import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const JoinRoom: React.FC = () => {
  const [userName, setUserName] = useState<string>("");
  const [roomId, setRoomId] = useState<string>("");
  const [error, setError] = useState<string>("");
  const navigate = useNavigate();

  const handleJoinRoom = () => {
    // Validate inputs
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    
    if (!roomId.trim()) {
      setError("Please enter a room ID");
      return;
    }

    // In a real application, you would verify if the room exists
    // For example, by checking against an API or database
    
    // For now, we'll simulate joining the room by navigating to a room page
    // with the roomId and userName as URL parameters or state
    navigate(`/room/${roomId}`, { 
      state: { 
        userName,
        roomId
      }
    });
  };

  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserName(e.target.value);
    setError("");
  };

  const handleRoomIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRoomId(e.target.value.toUpperCase());
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Join a Room</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="userName" className="block text-sm font-medium text-gray-700 mb-1">
              Your Name
            </label>
            <input
              type="text"
              id="userName"
              value={userName}
              onChange={handleUserNameChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your name"
            />
          </div>
          
          <div>
            <label htmlFor="roomId" className="block text-sm font-medium text-gray-700 mb-1">
              Room ID
            </label>
            <input
              type="text"
              id="roomId"
              value={roomId}
              onChange={handleRoomIdChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter room ID (e.g. ABC123)"
            />
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <button
            onClick={handleJoinRoom}
            className="w-full py-2 px-4 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Join Room
          </button>
        </div>
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Don't have a room ID? <a href="/" className="text-blue-600 hover:text-blue-800">Create a new room</a>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;

