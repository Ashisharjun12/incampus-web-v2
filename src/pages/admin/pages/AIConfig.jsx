import React, { useState, useEffect } from 'react';
import { adminAIAPI } from '@/api/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, TestTube, Shield, Settings, AlertTriangle } from 'lucide-react';

const AIConfig = () => {
    const [config, setConfig] = useState(null);
    const [availableModels, setAvailableModels] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [isModerating, setIsModerating] = useState(false);
    
    // Form state
    const [selectedModel, setSelectedModel] = useState('');
    const [apiKey, setApiKey] = useState('');
    
    // Test state
    const [testResult, setTestResult] = useState(null);
    const [testContent, setTestContent] = useState('');
    const [isNsfwEnabled, setIsNsfwEnabled] = useState(false);
    const [moderationResult, setModerationResult] = useState(null);
    const [badWordsResult, setBadWordsResult] = useState(null);

    useEffect(() => {
        loadConfig();
    }, []);

    const loadConfig = async () => {
        try {
            const response = await adminAIAPI.getConfig();
            if (response.data.success) {
                setConfig(response.data.data.currentConfig);
                setAvailableModels(response.data.data.availableModels);
                setSelectedModel(response.data.data.currentConfig.model);
                setApiKey(response.data.data.currentConfig.apiKey);
            }
        } catch (error) {
            toast.error('Failed to load AI configuration');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedModel || !apiKey) {
            toast.error('Please select a model and enter API key');
            return;
        }

        setIsSaving(true);
        try {
            const response = await adminAIAPI.updateConfig({
                model: selectedModel,
                apiKey: apiKey
            });
            
            if (response.data.success) {
                toast.success('AI configuration updated successfully');
                setConfig({ model: selectedModel, apiKey });
                setTestResult(response.data.data.testResult);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to update configuration');
        } finally {
            setIsSaving(false);
        }
    };

    const handleTestConnection = async () => {
        setIsTesting(true);
        try {
            const response = await adminAIAPI.testService();
            if (response.data.success) {
                setTestResult(response.data.data);
                toast.success('AI connection test successful');
            }
        } catch (error) {
            setTestResult({ success: false, error: error.response?.data?.error || 'Test failed' });
            toast.error('AI connection test failed');
        } finally {
            setIsTesting(false);
        }
    };

    const handleTestModeration = async () => {
        if (!testContent.trim()) {
            toast.error('Please enter content to test');
            return;
        }

        setIsModerating(true);
        setBadWordsResult(null);
        setModerationResult(null);

        try {
            // First check against bad words database
            const badWordsResponse = await adminAIAPI.testBadWords(testContent);
            
            if (badWordsResponse.data.success && badWordsResponse.data.data.hasBadWords) {
                setBadWordsResult(badWordsResponse.data.data);
                setModerationResult({
                    isAppropriate: false,
                    reason: `This content contains bad words: ${badWordsResponse.data.data.foundWords.map(f => f.word).join(', ')}. Not able to post. Please enable NSFW if this content is appropriate for your community.`,
                    severity: 'high',
                    categories: [...new Set(badWordsResponse.data.data.foundWords.map(f => f.category))],
                    language: 'mixed',
                    badWordsFound: true
                });
                toast.error('Bad words detected in content');
                return;
            }

            // If no bad words found, proceed with AI moderation
            const response = await adminAIAPI.testModeration(testContent, isNsfwEnabled);
            if (response.data.success) {
                setModerationResult(response.data.data);
                toast.success('Content moderation test completed');
            }
        } catch (error) {
            toast.error('Content moderation test failed');
        } finally {
            setIsModerating(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold">AI Configuration</h1>
                <p className="text-muted-foreground">
                    Configure AI models for content moderation and NSFW detection
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Configuration Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5" />
                            AI Model Configuration
                        </CardTitle>
                        <CardDescription>
                            Select an AI model from OpenRouter and configure your API key
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="model">AI Model</Label>
                            <Select value={selectedModel} onValueChange={setSelectedModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select an AI model" />
                                </SelectTrigger>
                                <SelectContent>
                                    {availableModels.map((model) => (
                                        <SelectItem key={model.id} value={model.id}>
                                            <div className="flex items-center justify-between w-full">
                                                <span>{model.name}</span>
                                                <Badge variant="outline" className="ml-2">
                                                    {model.provider}
                                                </Badge>
                                            </div>
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="apiKey">OpenRouter API Key</Label>
                            <Input
                                id="apiKey"
                                type="password"
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                placeholder="sk-or-v1-..."
                            />
                        </div>

                        <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="w-full"
                        >
                            {isSaving ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                'Save Configuration'
                            )}
                        </Button>
                    </CardContent>
                </Card>

                {/* Test Connection Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <TestTube className="h-5 w-5" />
                            Test Connection
                        </CardTitle>
                        <CardDescription>
                            Test your AI configuration and connection
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button 
                            onClick={handleTestConnection} 
                            disabled={isTesting}
                            variant="outline"
                            className="w-full"
                        >
                            {isTesting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing...
                                </>
                            ) : (
                                'Test AI Connection'
                            )}
                        </Button>

                        {testResult && (
                            <div className={`p-3 rounded-lg ${
                                testResult.success 
                                    ? 'bg-green-50 border border-green-200' 
                                    : 'bg-red-50 border border-red-200'
                            }`}>
                                <p className={`font-medium ${
                                    testResult.success ? 'text-green-800' : 'text-red-800'
                                }`}>
                                    {testResult.success ? '✅ Connection Successful' : '❌ Connection Failed'}
                                </p>
                                {testResult.message && (
                                    <p className="text-sm mt-1">{testResult.message}</p>
                                )}
                                {testResult.error && (
                                    <p className="text-sm mt-1">{testResult.error}</p>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Content Moderation Test */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Shield className="h-5 w-5" />
                        Content Moderation Test
                    </CardTitle>
                    <CardDescription>
                        Test the content moderation system (Bad Words + AI) with sample content
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="testContent">Test Content</Label>
                        <Textarea
                            id="testContent"
                            value={testContent}
                            onChange={(e) => setTestContent(e.target.value)}
                            placeholder="Enter content to test moderation (e.g., 'chut dogi test content')..."
                            rows={4}
                        />
                        <div className="flex gap-2">
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setTestContent('chut dogi test content')}
                            >
                                Test Bad Words
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => setTestContent('Hello, this is a normal test message')}
                            >
                                Test Normal Content
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="nsfwEnabled"
                            checked={isNsfwEnabled}
                            onChange={(e) => setIsNsfwEnabled(e.target.checked)}
                        />
                        <Label htmlFor="nsfwEnabled">NSFW Content Allowed</Label>
                    </div>

                    <Button 
                        onClick={handleTestModeration} 
                        disabled={isModerating}
                        variant="outline"
                    >
                        {isModerating ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Testing Moderation...
                            </>
                        ) : (
                            'Test Content Moderation'
                        )}
                    </Button>

                    {/* Bad Words Result */}
                    {badWordsResult && badWordsResult.hasBadWords && (
                        <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle className="h-5 w-5 text-red-600" />
                                <h4 className="font-semibold text-red-800">Bad Words Detected!</h4>
                            </div>
                            <p className="text-red-700 mb-2">
                                <strong>Found {badWordsResult.totalFound} bad word(s):</strong>
                            </p>
                            <div className="space-y-1 mb-3">
                                {badWordsResult.foundWords.map((word, index) => (
                                    <div key={index} className="text-sm">
                                        <span className="font-medium text-red-800">"{word.word}"</span>
                                        <span className="text-red-600 ml-2">
                                            ({word.category}, {word.language})
                                        </span>
                                    </div>
                                ))}
                            </div>
                            <div className="bg-red-100 p-3 rounded border border-red-200">
                                <p className="text-red-800 font-medium">
                                    ❌ <strong>Not able to post!</strong> Please enable NSFW if this content is appropriate for your community.
                                </p>
                            </div>
                        </div>
                    )}

                    {/* AI Moderation Result */}
                    {moderationResult && !badWordsResult?.hasBadWords && (
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">AI Moderation Result:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Appropriate:</span>
                                    <Badge variant={moderationResult.isAppropriate ? "default" : "destructive"}>
                                        {moderationResult.isAppropriate ? "Yes" : "No"}
                                    </Badge>
                                </div>
                                {moderationResult.reason && (
                                    <div>
                                        <span className="font-medium">Reason:</span>
                                        <p className="text-sm text-muted-foreground">{moderationResult.reason}</p>
                                    </div>
                                )}
                                {moderationResult.severity && (
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">Severity:</span>
                                        <Badge variant={
                                            moderationResult.severity === 'high' ? 'destructive' :
                                            moderationResult.severity === 'medium' ? 'secondary' : 'default'
                                        }>
                                            {moderationResult.severity}
                                        </Badge>
                                    </div>
                                )}
                                {moderationResult.categories && moderationResult.categories.length > 0 && (
                                    <div>
                                        <span className="font-medium">Categories:</span>
                                        <div className="flex flex-wrap gap-1 mt-1">
                                            {moderationResult.categories.map((category, index) => (
                                                <Badge key={index} variant="outline">
                                                    {category}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Combined Result with Bad Words */}
                    {moderationResult && badWordsResult?.hasBadWords && (
                        <div className="p-4 border rounded-lg">
                            <h4 className="font-semibold mb-2">Final Result:</h4>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Appropriate:</span>
                                    <Badge variant="destructive">No</Badge>
                                </div>
                                {moderationResult.reason && (
                                    <div>
                                        <span className="font-medium">Reason:</span>
                                        <p className="text-sm text-muted-foreground">{moderationResult.reason}</p>
                                    </div>
                                )}
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Severity:</span>
                                    <Badge variant="destructive">High</Badge>
                                </div>
                                <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                                    <p className="text-yellow-800 text-sm">
                                        <strong>Note:</strong> Content was blocked by bad words filter before AI moderation.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default AIConfig; 