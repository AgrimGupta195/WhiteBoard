import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

interface Room {
  id: string;
  name: string;
  creator: string;
}
const generateRoomId = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};
const CreateRoom = () => {
  const [roomName, setRoomName] = useState("");
  const [roomId, setRoomId] = useState("");
  const [userName, setUserName] = useState("");
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setRoomId(generateRoomId());
  }, []);
  const refreshRoomId = (): void => {
    setRoomId(generateRoomId());
    setCopySuccess(false);
  };
  const copyRoomId = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(roomId);
      setCopySuccess(true);
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy room ID: ', err);
    }
  };
  const handleCreateRoom = (): void => {
    setError("");
    if (!roomName.trim()) {
      setError("Please enter a room name");
      return;
    }
    if (!userName.trim()) {
      setError("Please enter your name");
      return;
    }
    const newRoom: Room = {
      id: roomId,
      name: roomName,
      creator: userName
    };
    
    setRooms((prevRooms) => [...prevRooms, newRoom]);
    
    // Show success message briefly before navigating
    setShowSuccess(true);
    
    // Navigate to the room after short delay
    setTimeout(() => {
      navigate(`/room/${roomId}`, {
        state: {
          userName,
          roomId,
          roomName
        }
      });
    }, 1500);
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setRoomName(e.target.value);
    setError("");
  };
  
  const handleUserNameChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setUserName(e.target.value);
    setError("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 max-w-md w-full bg-white rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Create a New Room</h2>
        
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
              Room ID (Auto-generated)
            </label>
            <div className="flex">
              <input
                type="text"
                id="roomId"
                value={roomId}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50"
              />
              <button
                type="button"
                onClick={refreshRoomId}
                className="px-3 py-2 bg-gray-200 text-gray-700 border-t border-b border-gray-300 hover:bg-gray-300 focus:outline-none"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
              <button
                type="button"
                onClick={copyRoomId}
                className="px-3 py-2 bg-gray-200 text-gray-700 rounded-r-md border-t border-r border-b border-gray-300 hover:bg-gray-300 focus:outline-none flex items-center"
                title="Copy to clipboard"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
              </button>
            </div>
            {copySuccess && (
              <p className="text-xs text-green-600 mt-1">Room ID copied to clipboard!</p>
            )}
          </div>
          
          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <button
            onClick={handleCreateRoom}
            className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Create & Join Room
          </button>
        </div>
        
        {showSuccess && (
          <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-md">
            Room created successfully! Joining room...
          </div>
        )}
        
        <div className="mt-6 text-center text-sm text-gray-500">
          Already have a room ID? <a href="/join" className="text-blue-600 hover:text-blue-800">Join an existing room</a>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;