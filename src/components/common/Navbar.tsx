//Navbar.tsx
import React, { useState, useEffect } from 'react';
import { AiOutlinePlus } from "react-icons/ai";
import { IoHomeOutline, IoSettingsOutline, IoPersonOutline, IoLogOutOutline } from "react-icons/io5";
import NewProject from './NewProject';
import { Project } from './NewProject';
import { projectApi } from '../../Api/apiClient';
import { toast } from '../../hooks/use-toast';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

const Navbar: React.FC = () => {
  const [isNewProjectOpen, setIsNewProjectOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Project[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Handle search input change
  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim() === '') {
      setSearchResults([]);
      setShowSuggestions(false);
      // Reset search in Dashboard
      window.dispatchEvent(new CustomEvent('search-projects', { detail: '' }));
      return;
    }

    try {
      // Fetch all projects and filter on client side
      const response = await projectApi.getAllProjects();
      const allProjects = response.data.map((project: any) => ({
        id: project.project_id,
        name: project.name,
        description: project.description,
        createdAt: new Date(project.created_at)
      }));
      
      // Filter projects based on search term
      const filtered = allProjects.filter((project: Project) => 
        project.name.toLowerCase().includes(value.toLowerCase()) ||
        project.description.toLowerCase().includes(value.toLowerCase())
      );
      
      setSearchResults(filtered);
      setShowSuggestions(true);
      
      // Dispatch event to Dashboard to update projects
      window.dispatchEvent(new CustomEvent('search-projects', { 
        detail: value
      }));
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch projects for search",
        variant: "destructive"
      });
    }
  };

  // Handle clicking on a suggestion
  const handleSuggestionClick = (project: Project) => {
    setSearchTerm(project.name);
    setShowSuggestions(false);
    // Dispatch event with the selected project
    window.dispatchEvent(new CustomEvent('select-project', { 
      detail: project.id
    }));
  };

  // Handle clicking outside suggestions
  useEffect(() => {
    const handleClickOutside = () => {
      setShowSuggestions(false);
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleCreateProject = async (project: Project) => {
    window.dispatchEvent(new Event('project-update'));
    
    toast({
      title: "Success",
      description: "Project created successfully"
    });
  };

  return (
    <TooltipProvider>
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
                placeholder="Search projects..."
                value={searchTerm}
                onChange={handleSearchChange}
                onClick={(e) => e.stopPropagation()} // Prevent closing suggestions when clicking in input
                className="w-96 pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-700"
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
              
              {/* Search Suggestions */}
              {showSuggestions && searchResults.length > 0 && (
                <div className="absolute z-50 w-full mt-1 bg-white rounded-lg border shadow-lg max-h-60 overflow-y-auto">
                  {searchResults.map((project) => (
                    <div
                      key={project.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSuggestionClick(project);
                      }}
                    >
                      <h3 className="font-medium text-gray-800">{project.name}</h3>
                      <p className="text-sm text-gray-500 truncate">{project.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <button 
                  onClick={() => setIsNewProjectOpen(true)}
                  className="bg-blue-700 text-white h-10 px-5 rounded-full hover:bg-blue-800 transition inline-flex items-center whitespace-nowrap"
                >
                  <div className="bg-white rounded-full p-1 mr-2">
                    <AiOutlinePlus className="w-4 h-4 text-black" />
                  </div>
                  <span>New Project</span>
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new project</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <div className="flex-1 flex justify-end items-center space-x-6 mr-8">
            <a href="/home" className="hover:text-purple-600 text-gray-600" title="Home">
              <IoHomeOutline className="w-6 h-6" />
            </a>
            <a href="/settings" className="hover:text-purple-600 text-gray-600" title="Settings">
              <IoSettingsOutline className="w-6 h-6" />
            </a>
            <a href="/profile" className="hover:text-purple-600 text-gray-600" title="Profile">
              <IoPersonOutline className="w-6 h-6" />
            </a>
            <a href="/logout" className="hover:text-red-600 text-gray-600" title="Logout">
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
    </TooltipProvider>
  );
};

export default Navbar;
