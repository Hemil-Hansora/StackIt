import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronUp, MessageSquare, Eye, CheckCircle, Clock } from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { useApp } from '../context/AppContext';
import { Question } from '../lib/types';

interface QuestionCardProps {
  question: Question;
  index?: number;
}

export default function QuestionCard({ question, index = 0 }: QuestionCardProps) {
  const { state, dispatch } = useApp();
  const author = state.users.find(u => u.id === question.authorId);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-transparent hover:border-l-blue-500">
        <CardContent className="p-6">
          <div className="flex gap-4">
            {/* Stats Column */}
            <div className="flex flex-col items-center space-y-3 text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
              <div className="flex flex-col items-center">
                <ChevronUp className="w-4 h-4" />
                <span className="font-medium text-lg">{question.votes}</span>
                <span className="text-xs">votes</span>
              </div>
              
              <div className="flex flex-col items-center">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{question.answerCount}</span>
                <span className="text-xs">answers</span>
              </div>
              
              <div className="flex flex-col items-center">
                <Eye className="w-4 h-4" />
                <span className="font-medium">{question.views}</span>
                <span className="text-xs">views</span>
              </div>
            </div>

            {/* Content Column */}
            <div className="flex-1 min-w-0">
              <div className="space-y-3">
                <Link 
                  to={`/q/${question.id}`}
                  className="block group"
                >
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 flex items-center">
                    {question.title}
                    {question.acceptedAnswerId && (
                      <CheckCircle className="w-5 h-5 ml-2 text-green-500 flex-shrink-0" />
                    )}
                  </h3>
                </Link>
                
                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-2">
                  {question.excerpt}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2">
                  {question.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        // Add tag to filter
                        dispatch({ type: 'SET_SELECTED_TAGS', payload: [tag] });
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>

                {/* Author and Date */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center space-x-2">
                    <Avatar className="w-6 h-6">
                      <AvatarImage src={author?.avatar} />
                      <AvatarFallback className="text-xs">
                        {author?.name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <Link 
                      to={`/user/${author?.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      {author?.name}
                    </Link>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">{author?.reputation} rep</span>
                  </div>
                  
                  <div className="flex items-center space-x-1 text-gray-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatDate(question.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}