//Navbar.tsx
import React, { useState } from 'react';
import { AiOutlinePlus } from "react-icons/ai";
import { 
    IoHomeOutline, 
    IoSettingsOutline, 
    IoPersonOutline, 
    IoLogOutOutline 
} from "react-icons/io5";
import NewProject from './NewProject';

const Navbar: React.FC = () => {
    const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);

    const handleCreateProject = (projectData: { name: string; description: string }) => {
        const projects = JSON.parse(localStorage.getItem('projects') || '[]');
        const newProject = {
            id: Date.now().toString(),
            ...projectData,
            createdAt: new Date()
        };
        localStorage.setItem('projects', JSON.stringify([...projects, newProject]));
        window.dispatchEvent(new Event('storage'));
    };

    return (
        <>
            <nav className="sticky top-0 z-50 bg-white shadow-sm flex items-center px-6 py-3">
                <div className="flex-1 flex items-center ml-8">
                    <div className="w-8 h-8 bg-purple-500 rounded-full mr-2"></div>
                    <span className="text-xl font-bold text-gray-800">Logo</span>
                </div>

                <div className="flex-1 flex justify-center items-center space-x-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search"
                            className="w-96 pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
                        />
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>
                    <button 
                        onClick={() => setIsNewProjectOpen(true)}
                        className="bg-blue-700 text-white h-10 px-5 rounded-full hover:bg-blue-800 transition inline-flex items-center whitespace-nowrap"
                    >
                        <div className="bg-white rounded-full p-1 mr-2">
                            <AiOutlinePlus className="w-4 h-4 text-black" />
                        </div>
                        <span>New Project</span>
                    </button>
                </div>

                <div className="flex-1 flex justify-end items-center space-x-6 mr-8">
                    <a 
                        href="/home" 
                        className="hover:text-purple-600 text-gray-600"
                        title="Home"
                    >
                        <IoHomeOutline className="w-6 h-6" />
                    </a>
                    <a 
                        href="/settings" 
                        className="hover:text-purple-600 text-gray-600"
                        title="Settings"
                    >
                        <IoSettingsOutline className="w-6 h-6" />
                    </a>
                    <a 
                        href="/profile" 
                        className="hover:text-purple-600 text-gray-600"
                        title="Profile"
                    >
                        <IoPersonOutline className="w-6 h-6" />
                    </a>
                    <a 
                        href="/logout" 
                        className="hover:text-red-600 text-gray-600"
                        title="Logout"
                    >
                        <IoLogOutOutline className="w-6 h-6" />
                    </a>
                </div>
            </nav>

            <NewProject 
                isOpen={isNewProjectOpen}
                onClose={() => setIsNewProjectOpen(false)}
                onCreateProject={handleCreateProject}
            />
        </>
    );
};

export default Navbar;