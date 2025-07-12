import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, ChevronLeft, ChevronRight, TrendingUp, Users, MessageSquare } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Badge } from '../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import QuestionCard from '../components/QuestionCard';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useQuestions } from '../hooks/useQuestions';

export default function HomePage() {
  const { state, dispatch } = useApp();
  const { getFilteredQuestions } = useQuestions();
  const [currentPage, setCurrentPage] = useState(1);
  const questionsPerPage = 10;
  
  const filteredQuestions = getFilteredQuestions();
  const totalPages = Math.ceil(filteredQuestions.length / questionsPerPage);
  const startIndex = (currentPage - 1) * questionsPerPage;
  const paginatedQuestions = filteredQuestions.slice(startIndex, startIndex + questionsPerPage);

  const allTags = Array.from(
    new Set(state.questions.flatMap(q => q.tags))
  ).slice(0, 20);

  const handleTagToggle = (tag: string) => {
    const newTags = state.selectedTags.includes(tag)
      ? state.selectedTags.filter(t => t !== tag)
      : [...state.selectedTags, tag];
    dispatch({ type: 'SET_SELECTED_TAGS', payload: newTags });
    setCurrentPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const stats = {
    totalQuestions: state.questions.length,
    totalUsers: state.users.length,
    totalAnswers: state.answers.length,
    answeredQuestions: state.questions.filter(q => q.answerCount > 0).length
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Stats Cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <MessageSquare className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalQuestions}</div>
              <p className="text-xs text-muted-foreground">
                {stats.answeredQuestions} answered
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Community members
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalAnswers}</div>
              <p className="text-xs text-muted-foreground">
                Solutions provided
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Answer Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.totalQuestions > 0 ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100) : 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                Questions answered
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              All Questions
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {filteredQuestions.length} questions found
            </p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search questions by title, content, or tags..."
              value={state.searchQuery}
              onChange={(e) => dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value })}
              className="pl-12 pr-4 h-12 text-lg"
            />
          </form>

          {/* Sort and Filter Options */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Sort Buttons */}
            <div className="flex gap-2">
              <Button
                variant={state.sortBy === 'newest' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'newest' })}
                size="sm"
              >
                Newest
              </Button>
              <Button
                variant={state.sortBy === 'votes' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'votes' })}
                size="sm"
              >
                Most Voted
              </Button>
              <Button
                variant={state.sortBy === 'unanswered' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'unanswered' })}
                size="sm"
              >
                Unanswered
              </Button>
              <Button
                variant={state.sortBy === 'trending' ? 'default' : 'outline'}
                onClick={() => dispatch({ type: 'SET_SORT_BY', payload: 'trending' })}
                size="sm"
              >
                Trending
              </Button>
            </div>
          </div>

          {/* Tags Filter */}
          {allTags.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Filter by tags:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={state.selectedTags.includes(tag) ? 'default' : 'secondary'}
                    className="cursor-pointer hover:bg-blue-600 hover:text-white transition-colors"
                    onClick={() => handleTagToggle(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              {state.selectedTags.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch({ type: 'SET_SELECTED_TAGS', payload: [] })}
                  className="text-blue-600 hover:text-blue-700"
                >
                  Clear filters
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Questions List */}
        <div className="space-y-4">
          {paginatedQuestions.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <div className="text-gray-500 dark:text-gray-400">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-medium mb-2">No questions found</h3>
                <p>Try adjusting your search terms or filters.</p>
              </div>
            </motion.div>
          ) : (
            paginatedQuestions.map((question, index) => (
              <QuestionCard key={question.id} question={question} index={index} />
            ))
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center space-x-2 pt-8">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </Button>
            
            <div className="flex space-x-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <Button
                    key={pageNum}
                    variant={currentPage === pageNum ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCurrentPage(pageNum)}
                    className="w-10"
                  >
                    {pageNum}
                  </Button>
                );
              })}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </Layout>
  );
}