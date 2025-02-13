// Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Project } from '../components/common/NewProject';
import EditProject from '../components/common/EditProject';
import ProjectDetail from '../components/common/ProjectDetail';
import Loading from '../components/common/Loading';
import { projectApi } from '../Api/apiClient';
import { toast } from '../hooks/use-toast';

const Dashboard: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [operationLoading, setOperationLoading] = useState(false);
    
    useEffect(() => {
        fetchProjects();
        window.addEventListener('project-update', fetchProjects);
        return () => {
            window.removeEventListener('project-update', fetchProjects);
        };
    }, []);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const response = await projectApi.getAllProjects();
            const formattedProjects = response.data.map((project: any) => ({
                id: project.project_id,
                name: project.name,
                description: project.description,
                createdAt: new Date(project.created_at)
            }));
            setProjects(formattedProjects);
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to fetch projects",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        setOperationLoading(true);
        try {
            await projectApi.deleteProject(projectId);
            setProjects(projects.filter(project => project.id !== projectId));
            toast({
                title: "Success",
                description: "Project deleted successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete project",
                variant: "destructive"
            });
        } finally {
            setOperationLoading(false);
        }
    };

    const handleEdit = (project: Project) => {
        setEditingProject(project);
        setIsEditModalOpen(true);
    };

    const handleUpdateProject = async (updatedProject: Project) => {
        setOperationLoading(true);
        try {
            await projectApi.updateProject(updatedProject.id, {
                name: updatedProject.name,
                description: updatedProject.description
            });
            
            setProjects(projects.map(project =>
                project.id === updatedProject.id ? updatedProject : project
            ));
            setIsEditModalOpen(false);
            toast({
                title: "Success",
                description: "Project updated successfully"
            });
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update project",
                variant: "destructive"
            });
        } finally {
            setOperationLoading(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (operationLoading) {
        return <Loading />;
    }

    const handleProjectDetails = (project: Project) => {
        setSelectedProject(project);
    };

    if (selectedProject) {
        return (
            <ProjectDetail
                project={selectedProject}
                onBack={() => setSelectedProject(null)}
            />
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-indigo-600 mb-2">Welcome to your Prompt Management</h1>
                    <p className="text-gray-600">Manage your projects and prompts in one click. Create and organize your data in seconds.</p>
                </div>

                <div className="space-y-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white rounded-xl shadow-lg p-6 relative hover:shadow-xl transition-shadow duration-300"

                        >
                            <div>
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-start space-x-4">
                                        <div className="p-2 bg-gray-50 rounded-lg">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-semibold text-gray-800">Project: {project.name}</h2>
                                            <p className="text-sm text-gray-500 mt-1">Created on: {new Date(project.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleEdit(project);
                                            }}
                                            className="p-2 rounded-full hover:bg-indigo-50 text-indigo-600 transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(project.id);
                                            }}
                                            className="p-2 rounded-full hover:bg-red-50 text-red-600 transition-colors duration-200"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                                    <p className="text-gray-700">{project.description}</p>
                                </div>

                                <div
                                    className="absolute bottom-4 right-6"
                                    onClick={() => handleProjectDetails(project)}
                                >
                                    <div className="w-8 h-8 bg-indigo-50 rounded-full flex items-center justify-center hover:bg-indigo-200 hover:scale-110 transition-transform duration-200">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            className="h-5 w-5 text-indigo-600"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>

                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <EditProject
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                project={editingProject}
                onUpdateProject={handleUpdateProject}
            />
        </div>
    );
};

export default Dashboard;