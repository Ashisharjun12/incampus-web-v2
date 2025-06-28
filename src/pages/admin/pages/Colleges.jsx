import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from 'sonner';
import { collegeAPI } from '@/api/api';
import CollegeForm from '../components/CollegeForm';

const CollegesPage = () => {
    const [colleges, setColleges] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [selectedCollege, setSelectedCollege] = useState(null);
    const [collegeToDelete, setCollegeToDelete] = useState(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    useEffect(() => {
        fetchColleges();
    }, []);

    const fetchColleges = async () => {
        setLoading(true);
        try {
            const response = await collegeAPI.getAll();
            if (response.data && response.data.data) {
                setColleges(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to fetch colleges');
            console.error('Error fetching colleges:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = (savedCollege) => {
        if (selectedCollege) {
            setColleges(colleges.map(c => c.id === savedCollege.id ? savedCollege : c));
        } else {
            setColleges([savedCollege, ...colleges]);
        }
        setIsFormOpen(false);
        setSelectedCollege(null);
    };

    const handleAddNew = () => {
        setSelectedCollege(null);
        setIsFormOpen(true);
    };

    const handleEdit = (college) => {
        setSelectedCollege(college);
        setIsFormOpen(true);
    };

    const handleDeleteClick = (college) => {
        setCollegeToDelete(college);
        setIsDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!collegeToDelete) return;
        
        try {
            await collegeAPI.delete(collegeToDelete.id);
            setColleges(colleges.filter(c => c.id !== collegeToDelete.id));
            toast.success('College deleted successfully');
        } catch (error) {
            toast.error('Failed to delete college');
            console.error('Error deleting college:', error);
        } finally {
            setCollegeToDelete(null);
            setIsDeleteDialogOpen(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return <div>Loading colleges...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Colleges</h1>
                    <p className="text-muted-foreground">Manage all registered colleges on the platform.</p>
                </div>
                <Button onClick={handleAddNew}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Add College
                </Button>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[80px] hidden sm:table-cell">Logo</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead className="hidden md:table-cell">Created At</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {colleges.length > 0 ? (
                                colleges.map((college) => (
                                    <TableRow key={college.id}>
                                        <TableCell className="hidden sm:table-cell">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={college.logoUrl} alt={college.name} />
                                                <AvatarFallback>{college.name?.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                        </TableCell>
                                        <TableCell className="font-medium">{college.name}</TableCell>
                                        <TableCell>{college.location}</TableCell>
                                        <TableCell className="hidden md:table-cell">{formatDate(college.createdAt)}</TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button aria-haspopup="true" size="icon" variant="ghost">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                        <span className="sr-only">Toggle menu</span>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuItem onClick={() => handleEdit(college)}>Edit</DropdownMenuItem>
                                                    <DropdownMenuItem onClick={() => handleDeleteClick(college)} className="text-red-600">Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="5" className="h-24 text-center">
                                        No colleges found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <CollegeForm
                open={isFormOpen}
                onOpenChange={setIsFormOpen}
                college={selectedCollege}
                onSave={handleSave}
            />

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the college "{collegeToDelete?.name}" and remove it from our servers.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="bg-red-600 hover:bg-red-700">
                            Delete College
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default CollegesPage; 