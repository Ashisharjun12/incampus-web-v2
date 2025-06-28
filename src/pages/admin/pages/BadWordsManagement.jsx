import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { adminAIAPI } from '@/api/api';
import { Skeleton } from '@/components/ui/skeleton';

const BadWordsManagement = () => {
    const [badWordsLists, setBadWordsLists] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddDialog, setShowAddDialog] = useState(false);
    const [testContent, setTestContent] = useState('');
    const [testResult, setTestResult] = useState(null);
    const [isTesting, setIsTesting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        category: 'general',
        language: 'hindi',
        wordsData: []
    });

    // CSV upload states
    const [csvData, setCsvData] = useState({
        name: '',
        category: 'general',
        language: 'hindi',
        csvFile: null
    });

    useEffect(() => {
        loadBadWords();
    }, []);

    const loadBadWords = async () => {
        try {
            setIsLoading(true);
            const response = await adminAIAPI.getBadWords();
            if (response.data.success) {
                setBadWordsLists(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to load bad words lists');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddManual = async () => {
        try {
            if (!formData.name || formData.wordsData.length === 0) {
                toast.error('Name and words are required');
                return;
            }

            const response = await adminAIAPI.addBadWords(formData);
            if (response.data.success) {
                toast.success('Bad words list added successfully');
                setShowAddDialog(false);
                setFormData({ name: '', category: 'general', language: 'hindi', wordsData: [] });
                loadBadWords();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to add bad words list');
        }
    };

    const handleUploadCSV = async () => {
        try {
            if (!csvData.name || !csvData.csvFile) {
                toast.error('Name and CSV file are required');
                return;
            }

            const formData = new FormData();
            formData.append('name', csvData.name);
            formData.append('category', csvData.category);
            formData.append('language', csvData.language);
            formData.append('csvFile', csvData.csvFile);

            const response = await adminAIAPI.uploadBadWordsCSV(formData);
            if (response.data.success) {
                toast.success(response.data.message);
                setCsvData({ name: '', category: 'general', language: 'hindi', csvFile: null });
                loadBadWords();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to upload CSV');
        }
    };

    const handleDelete = async () => {
        if (!deletingId) return;
        
        try {
            await adminAIAPI.deleteBadWords(deletingId);
            toast.success('Bad words list deleted successfully');
            setDeletingId(null);
            loadBadWords();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to delete bad words list');
        }
    };

    const handleTestContent = async () => {
        if (!testContent.trim()) {
            toast.error('Please enter content to test');
            return;
        }

        try {
            setIsTesting(true);
            const response = await adminAIAPI.testBadWords(testContent);
            if (response.data.success) {
                setTestResult(response.data.data);
            }
        } catch (error) {
            toast.error('Failed to test content');
        } finally {
            setIsTesting(false);
        }
    };

    const addWord = () => {
        const word = document.getElementById('wordInput').value.trim();
        if (word) {
            setFormData(prev => ({
                ...prev,
                wordsData: [...prev.wordsData, word]
            }));
            document.getElementById('wordInput').value = '';
        }
    };

    const removeWord = (index) => {
        setFormData(prev => ({
            ...prev,
            wordsData: prev.wordsData.filter((_, i) => i !== index)
        }));
    };

    const getCategoryColor = (category) => {
        const colors = {
            vulgar: 'bg-red-100 text-red-800',
            hate: 'bg-orange-100 text-orange-800',
            sexual: 'bg-pink-100 text-pink-800',
            general: 'bg-gray-100 text-gray-800'
        };
        return colors[category] || colors.general;
    };

    const getLanguageColor = (language) => {
        const colors = {
            hindi: 'bg-green-100 text-green-800',
            english: 'bg-blue-100 text-blue-800',
            hinglish: 'bg-purple-100 text-purple-800'
        };
        return colors[language] || colors.hindi;
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-64 w-full" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold">Bad Words Management</h1>
                    <p className="text-muted-foreground">Manage content moderation word lists</p>
                </div>
                <Button onClick={() => setShowAddDialog(true)}>Add Bad Words List</Button>
            </div>

            <Tabs defaultValue="lists" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="lists">Bad Words Lists</TabsTrigger>
                    <TabsTrigger value="test">Test Content</TabsTrigger>
                </TabsList>

                <TabsContent value="lists" className="space-y-4">
                    {badWordsLists.length === 0 ? (
                        <Card>
                            <CardContent className="text-center py-8">
                                <p className="text-muted-foreground">No bad words lists found</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid gap-4">
                            {badWordsLists.map((list) => (
                                <Card key={list.id}>
                                    <CardHeader>
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <CardTitle>{list.name}</CardTitle>
                                                <CardDescription>
                                                    Source: {list.source} • Created: {new Date(list.createdAt).toLocaleDateString()}
                                                </CardDescription>
                                            </div>
                                            <div className="flex gap-2">
                                                <Badge className={getCategoryColor(list.category)}>
                                                    {list.category}
                                                </Badge>
                                                <Badge className={getLanguageColor(list.language)}>
                                                    {list.language}
                                                </Badge>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground">
                                                Words count: {Array.isArray(list.wordsData) ? list.wordsData.length : 
                                                    (list.wordsData.words ? list.wordsData.words.length : 0)}
                                            </p>
                                            <div className="flex gap-2">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm"
                                                    onClick={() => setDeletingId(list.id)}
                                                >
                                                    Delete
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="test" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Test Content Against Bad Words</CardTitle>
                            <CardDescription>
                                Enter content to test against all active bad words lists
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label htmlFor="testContent">Content to Test</Label>
                                <Textarea
                                    id="testContent"
                                    placeholder="Enter content to test..."
                                    value={testContent}
                                    onChange={(e) => setTestContent(e.target.value)}
                                    rows={4}
                                />
                            </div>
                            <Button onClick={handleTestContent} disabled={isTesting}>
                                {isTesting ? 'Testing...' : 'Test Content'}
                            </Button>

                            {testResult && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold">Test Results:</h4>
                                    <div className={`p-3 rounded ${testResult.hasBadWords ? 'bg-red-50 border border-red-200' : 'bg-green-50 border border-green-200'}`}>
                                        <p className={`font-medium ${testResult.hasBadWords ? 'text-red-800' : 'text-green-800'}`}>
                                            {testResult.hasBadWords ? 'Bad words found!' : 'No bad words found'}
                                        </p>
                                        {testResult.hasBadWords && (
                                            <div className="mt-2">
                                                <p className="text-sm text-red-700">
                                                    Found {testResult.totalFound} bad word(s):
                                                </p>
                                                <div className="mt-1 space-y-1">
                                                    {testResult.foundWords.map((word, index) => (
                                                        <div key={index} className="text-sm">
                                                            <span className="font-medium">{word.word}</span>
                                                            <span className="text-red-600 ml-2">
                                                                ({word.category}, {word.language})
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Add Bad Words Dialog */}
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Add Bad Words List</DialogTitle>
                    </DialogHeader>
                    <Tabs defaultValue="manual" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
                            <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                        </TabsList>
                        
                        <TabsContent value="manual" className="space-y-4">
                            <div>
                                <Label htmlFor="name">List Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Hindi Vulgar Words"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="category">Category</Label>
                                    <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="vulgar">Vulgar</SelectItem>
                                            <SelectItem value="hate">Hate Speech</SelectItem>
                                            <SelectItem value="sexual">Sexual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="language">Language</Label>
                                    <Select value={formData.language} onValueChange={(value) => setFormData(prev => ({ ...prev, language: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="hinglish">Hinglish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="wordInput">Add Words</Label>
                                <div className="flex gap-2">
                                    <Input
                                        id="wordInput"
                                        placeholder="Enter a word..."
                                        onKeyPress={(e) => e.key === 'Enter' && addWord()}
                                    />
                                    <Button type="button" onClick={addWord}>Add</Button>
                                </div>
                            </div>
                            {formData.wordsData.length > 0 && (
                                <div>
                                    <Label>Words ({formData.wordsData.length})</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.wordsData.map((word, index) => (
                                            <Badge key={index} variant="secondary" className="cursor-pointer" onClick={() => removeWord(index)}>
                                                {word} ×
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleAddManual}>Add List</Button>
                            </DialogFooter>
                        </TabsContent>

                        <TabsContent value="csv" className="space-y-4">
                            <div>
                                <Label htmlFor="csvName">List Name</Label>
                                <Input
                                    id="csvName"
                                    value={csvData.name}
                                    onChange={(e) => setCsvData(prev => ({ ...prev, name: e.target.value }))}
                                    placeholder="e.g., Hindi Vulgar Words from CSV"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="csvCategory">Category</Label>
                                    <Select value={csvData.category} onValueChange={(value) => setCsvData(prev => ({ ...prev, category: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="general">General</SelectItem>
                                            <SelectItem value="vulgar">Vulgar</SelectItem>
                                            <SelectItem value="hate">Hate Speech</SelectItem>
                                            <SelectItem value="sexual">Sexual</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="csvLanguage">Language</Label>
                                    <Select value={csvData.language} onValueChange={(value) => setCsvData(prev => ({ ...prev, language: value }))}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="hindi">Hindi</SelectItem>
                                            <SelectItem value="english">English</SelectItem>
                                            <SelectItem value="hinglish">Hinglish</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div>
                                <Label htmlFor="csvFile">CSV File</Label>
                                <Input
                                    id="csvFile"
                                    type="file"
                                    accept=".csv"
                                    onChange={(e) => setCsvData(prev => ({ ...prev, csvFile: e.target.files[0] }))}
                                />
                                <div className="flex gap-2 mt-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => {
                                            const csvContent = 'word,category,language,severity\nchut,vulgar,hindi,high\nbc,vulgar,hinglish,medium\ndogi,vulgar,hindi,medium\nmc,vulgar,hinglish,medium';
                                            const blob = new Blob([csvContent], { type: 'text/csv' });
                                            const url = window.URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = 'sample_bad_words.csv';
                                            a.click();
                                            window.URL.revokeObjectURL(url);
                                        }}
                                    >
                                        Download Sample CSV
                                    </Button>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">
                                    CSV should have columns: word, category (optional), language (optional), severity (optional)
                                </p>
                            </div>
                            <DialogFooter>
                                <DialogClose asChild>
                                    <Button variant="secondary">Cancel</Button>
                                </DialogClose>
                                <Button onClick={handleUploadCSV}>Upload CSV</Button>
                            </DialogFooter>
                        </TabsContent>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Bad Words List</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the bad words list. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default BadWordsManagement; 