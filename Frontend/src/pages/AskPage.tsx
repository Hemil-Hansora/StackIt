import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Plus, X, HelpCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import RichTextEditor from '../components/RichTextEditor';
import Layout from '../components/Layout';
import { useAuth } from '../hooks/useAuth';
import { useQuestions } from '../hooks/useQuestions';
import { availableTags } from '../lib/mock-data';

export default function AskPage() {
  const navigate = useNavigate();
  const { isAuthenticated, currentUser } = useAuth();
  const { addQuestion } = useQuestions();
  
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim()) && tags.length < 5) {
      setTags([...tags, newTag.trim().toLowerCase()]);
      setNewTag('');
      if (errors.tags) {
        setErrors(prev => ({ ...prev, tags: '' }));
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!title.trim()) {
      newErrors.title = 'Title is required';
    } else if (title.length < 10) {
      newErrors.title = 'Title must be at least 10 characters';
    }

    if (!body.trim() || body === '<p><br></p>') {
      newErrors.body = 'Question description is required';
    } else if (body.length < 20) {
      newErrors.body = 'Description must be at least 20 characters';
    }

    if (tags.length === 0) {
      newErrors.tags = 'At least one tag is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const questionId = addQuestion({
        title: title.trim(),
        body: body.trim(),
        excerpt: body.replace(/<[^>]*>/g, '').substring(0, 150) + (body.length > 150 ? '...' : ''),
        tags,
        authorId: currentUser!.id
      });
      
      navigate(`/q/${questionId}`);
    } catch (error) {
      console.error('Error creating question:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const suggestedTags = availableTags.filter(tag => 
    tag.includes(newTag.toLowerCase()) && !tags.includes(tag)
  ).slice(0, 8);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Questions</span>
          </Button>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Main Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <HelpCircle className="w-5 h-5" />
                  <span>Ask a Question</span>
                </CardTitle>
                <p className="text-gray-600 dark:text-gray-400">
                  Get help from the community by asking a clear, detailed question.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Title */}
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      type="text"
                      value={title}
                      onChange={(e) => {
                        setTitle(e.target.value);
                        if (errors.title) {
                          setErrors(prev => ({ ...prev, title: '' }));
                        }
                      }}
                      placeholder="What's your programming question? Be specific."
                      className={`text-lg ${errors.title ? 'border-red-500' : ''}`}
                      maxLength={200}
                    />
                    {errors.title && (
                      <p className="text-sm text-red-500 mt-1">{errors.title}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {title.length}/200 characters
                    </p>
                  </div>

                  {/* Body */}
                  <div>
                    <Label>Description *</Label>
                    <div className={errors.body ? 'border border-red-500 rounded-lg' : ''}>
                      <RichTextEditor
                        value={body}
                        onChange={(value) => {
                          setBody(value);
                          if (errors.body) {
                            setErrors(prev => ({ ...prev, body: '' }));
                          }
                        }}
                        placeholder="Provide details about your question. Include what you've tried and what specific help you need."
                        height="300px"
                      />
                    </div>
                    {errors.body && (
                      <p className="text-sm text-red-500 mt-1">{errors.body}</p>
                    )}
                  </div>

                  {/* Tags */}
                  <div>
                    <Label>Tags * (up to 5)</Label>
                    <div className="space-y-3">
                      <div className="flex gap-2">
                        <Input
                          type="text"
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={handleKeyPress}
                          placeholder="Add a tag (e.g., javascript, react, css)"
                          className="flex-1"
                          maxLength={20}
                        />
                        <Button
                          type="button"
                          onClick={handleAddTag}
                          disabled={!newTag.trim() || tags.length >= 5}
                          size="sm"
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      {/* Suggested Tags */}
                      {newTag && suggestedTags.length > 0 && (
                        <div className="space-y-2">
                          <p className="text-sm text-gray-600 dark:text-gray-400">Suggestions:</p>
                          <div className="flex flex-wrap gap-2">
                            {suggestedTags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="outline"
                                className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                                onClick={() => {
                                  if (!tags.includes(tag) && tags.length < 5) {
                                    setTags([...tags, tag]);
                                    setNewTag('');
                                  }
                                }}
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {/* Current Tags */}
                      {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="flex items-center gap-1 bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    {errors.tags && (
                      <p className="text-sm text-red-500 mt-1">{errors.tags}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      Add tags to help others find your question. Use existing tags when possible.
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-4 pt-4 border-t">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Question'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Tips */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div>
                  <h4 className="font-medium mb-2">Great questions have:</h4>
                  <ul className="space-y-1 text-gray-600 dark:text-gray-400">
                    <li>• A clear, specific title</li>
                    <li>• Detailed problem description</li>
                    <li>• Code examples when relevant</li>
                    <li>• What you've tried so far</li>
                    <li>• Relevant tags</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {availableTags.slice(0, 15).map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900"
                      onClick={() => {
                        if (!tags.includes(tag) && tags.length < 5) {
                          setTags([...tags, tag]);
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}