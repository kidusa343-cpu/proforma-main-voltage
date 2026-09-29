
"use client";

import { useState, useEffect } from "react";
import { User } from "lucide-react";
import jwt from "jsonwebtoken";

const Page = () => {
  const [username, setUsername] = useState("Loading...");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const token = await window.electronAPI.getAuthToken();
        const decoded = jwt.decode(token);
        if (decoded && (decoded as jwt.JwtPayload).usernameOrEmail) {
          setUsername((decoded as jwt.JwtPayload).usernameOrEmail);
        } else {
          setUsername("Unknown User");
        }
      } catch (error) {
        console.error('Error fetching username:', error);
        setUsername("Unknown User");
      }
    };

    fetchUsername();
  }, []);

  return (
    <div className="flex flex-col gap-20 items-center">
      <div className="w-3/4 bg-Sidebar dark:bg-gray-800 rounded-md shadow-md h-52">
        <div className="flex w-full justify-end p-8">
          {/* <Button className="bg-slate-600 hover:bg-slate-700">Edit <Edit /></Button> */}
        </div>
        <div className="w-full h-12"></div>
        <div className="w-full flex justify-around items-center"> {/* Changed items-end to items-center */}
          <p className="w-1/3 dark:bg-gray-800 rounded-sm bottom-1 border-slate-800 bg-white pl-4 py-2">
            <span className="font-bold">Username:</span> {username}
          </p>
          <div className="w-40 dark:bg-gray-500 h-40 rounded-full bg-white flex justify-center items-center">
            <User className="h-20 text-slate-600 w-20" />
          </div>
          <div className="w-1/3"></div>
        </div>
      </div>
    </div>
  );
};

export default Page;