import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Project } from './NewProject';
import { toast } from '../../hooks/use-toast';
import Loading from './Loading';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../ui/tooltip';

interface EditProjectProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onUpdateProject: (updatedProject: Project) => void;
}

const EditProject: React.FC<EditProjectProps> = ({ 
  isOpen, 
  onClose, 
  project, 
  onUpdateProject 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description
      });
    }
  }, [project]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!project) return;

    if (!formData.name.trim() || !formData.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Project name and description are required",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const updatedProject = {
        ...project,
        name: formData.name,
        description: formData.description
      };
      
      await onUpdateProject(updatedProject);
      
      toast({
        title: "Success",
        description: `Project "${formData.name}" updated successfully`,
        variant: "default"
      });
      
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to update project. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (!project) return null;

  return (
    <TooltipProvider>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-[425px]">
          {loading && <Loading />}
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium text-gray-700">
                Project Name
              </label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter project name"
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium text-gray-700">
                Project Description
              </label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Enter project description"
                required
                className="min-h-[100px]"
              />
            </div>
            <DialogFooter>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => {
                      setFormData({
                        name: project.name,
                        description: project.description
                      });
                      onClose();
                    }}
                  >
                    Cancel
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Discard changes and close</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
                    Update Project
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Update project details</p>
                </TooltipContent>
              </Tooltip>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default EditProject;
