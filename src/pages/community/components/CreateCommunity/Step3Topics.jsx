import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import topicsData from '@/data/topics.json';

const Step3Topics = ({ formData, setFormData }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const toggleTopic = (topic) => {
        setFormData(prev => {
            const currentTopics = prev.topics || [];
            // Limit to 5 topics
            if (currentTopics.length >= 5 && !currentTopics.includes(topic)) {
                return prev; 
            }
            const newTopics = currentTopics.includes(topic)
                ? currentTopics.filter(t => t !== topic)
                : [...currentTopics, topic];
            return { ...prev, topics: newTopics };
        });
    };

    return (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-medium">Add topics</h3>
                <p className="text-sm text-muted-foreground">
                    Help others discover your community by adding topics. (Max 5)
                </p>
            </div>
            <div className="space-y-4">
                <Input
                    placeholder="Search for topics..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <div className="space-y-5 py-2 max-h-[300px] overflow-y-auto pr-2">
                    {Object.entries(topicsData)
                        .map(([category, data]) => {
                            const filteredTopics = data.topics.filter(topic =>
                                topic.toLowerCase().includes(searchTerm.toLowerCase())
                            );
                            if (filteredTopics.length === 0) return null;
                            return { category, data, filteredTopics };
                        })
                        .filter(Boolean)
                        .map(({ category, data, filteredTopics }) => (
                            <div key={category}>
                                <h4 className="font-semibold mb-2 flex items-center gap-2">
                                    <span className="text-xl">{data.icon}</span>
                                    {category}
                                </h4>
                                <div className="flex flex-wrap gap-2">
                                    {filteredTopics.map((topic) => (
                                        <Badge
                                            key={topic}
                                            variant={formData.topics?.includes(topic) ? "default" : "secondary"}
                                            onClick={() => toggleTopic(topic)}
                                            className="cursor-pointer"
                                        >
                                            {topic}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        ))}
                </div>
                 <div className="pt-4">
                    <h4 className="font-medium text-sm mb-2">Selected topics ({formData.topics?.length || 0}/5):</h4>
                    {formData.topics?.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                            {formData.topics.map((topic) => (
                                <Badge key={topic} variant="outline" className="flex items-center gap-2">
                                    {topic}
                                    <button onClick={() => toggleTopic(topic)} className="ml-1 text-muted-foreground hover:text-foreground text-xs font-bold">
                                        &#10005;
                                    </button>
                                </Badge>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No topics selected.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Step3Topics; 