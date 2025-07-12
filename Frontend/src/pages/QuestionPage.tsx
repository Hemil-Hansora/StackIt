import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  ChevronUp, 
  ChevronDown, 
  CheckCircle, 
  MessageSquare, 
  Eye, 
  Calendar,
  Award,
  MessageCircle
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Textarea } from '../components/ui/textarea';
import RichTextEditor from '../components/RichTextEditor';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';
import { useQuestions } from '../hooks/useQuestions';
import { useVoting } from '../hooks/useVoting';

export default function QuestionPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { state } = useApp();
  const { isAuthenticated, currentUser } = useAuth();
  const { addAnswer, acceptAnswer, addComment, incrementViewCount } = useQuestions();
  const { vote, getUserVote } = useVoting();
  
  const [answerBody, setAnswerBody] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCommentForm, setShowCommentForm] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  const question = state.questions.find(q => q.id === id);
  const answers = state.answers.filter(a => a.questionId === id);
  const questionAuthor = question ? state.users.find(u => u.id === question.authorId) : null;
  const comments = state.comments.filter(c => c.parentId === id && c.parentType === 'question');

  useEffect(() => {
    if (question) {
      incrementViewCount(question.id);
    }
  }, [question, incrementViewCount]);

  if (!question) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Question Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The question you're looking for doesn't exist or has been removed.
          </p>
          <Button onClick={() => navigate('/')}>
            Back to Questions
          </Button>
        </div>
      </Layout>
    );
  }

  const handleVoteQuestion = (direction: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }
    vote(question.id, 'question', direction);
  };

  const handleVoteAnswer = (answerId: string, direction: 'up' | 'down') => {
    if (!isAuthenticated) {
      alert('Please sign in to vote');
      return;
    }
    vote(answerId, 'answer', direction);
  };

  const handleAcceptAnswer = (answerId: string) => {
    if (!isAuthenticated || currentUser?.id !== question.authorId) {
      alert('Only the question author can accept answers');
      return;
    }
    acceptAnswer(answerId, question.id);
  };

  const handleSubmitAnswer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      alert('Please sign in to answer');
      return;
    }
    
    if (!answerBody.trim()) {
      alert('Please enter an answer');
      return;
    }

    setIsSubmitting(true);
    
    try {
      addAnswer({
        questionId: question.id,
        body: answerBody.trim(),
        authorId: currentUser!.id
      });
      
      setAnswerBody('');
    } catch (error) {
      console.error('Error submitting answer:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitComment = (parentId: string, parentType: 'question' | 'answer') => {
    if (!isAuthenticated || !commentText.trim()) return;

    addComment({
      parentId,
      parentType,
      body: commentText.trim(),
      authorId: currentUser!.id
    });

    setCommentText('');
    setShowCommentForm(null);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const questionVote = getUserVote(question.id);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
          <Link to="/" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1">
            <ArrowLeft className="w-4 h-4" />
            <span>All Questions</span>
          </Link>
        </div>

        {/* Question */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Vote Column */}
                <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteQuestion('up')}
                    className={`p-2 ${questionVote?.type === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-green-100 dark:hover:bg-green-900'}`}
                  >
                    <ChevronUp className="w-6 h-6" />
                  </Button>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {question.votes}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleVoteQuestion('down')}
                    className={`p-2 ${questionVote?.type === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-red-100 dark:hover:bg-red-900'}`}
                  >
                    <ChevronDown className="w-6 h-6" />
                  </Button>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                    {question.title}
                  </h1>

                  <div className="prose prose-sm max-w-none dark:prose-invert mb-6"
                       dangerouslySetInnerHTML={{ __html: question.body }} />

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {question.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Question Meta */}
                  <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <MessageSquare className="w-4 h-4" />
                        <span>{question.answerCount} answers</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Eye className="w-4 h-4" />
                        <span>{question.views} views</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCommentForm(showCommentForm === question.id ? null : question.id)}
                        className="text-blue-600 hover:text-blue-700"
                      >
                        <MessageCircle className="w-4 h-4 mr-1" />
                        Add comment
                      </Button>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>Asked {formatDate(question.createdAt)}</span>
                      </div>
                      <Link 
                        to={`/user/${questionAuthor?.id}`}
                        className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={questionAuthor?.avatar} />
                          <AvatarFallback>
                            {questionAuthor?.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {questionAuthor?.name}
                          </p>
                          <p className="text-xs">
                            {questionAuthor?.reputation} reputation
                          </p>
                        </div>
                      </Link>
                    </div>
                  </div>

                  {/* Comments */}
                  {comments.length > 0 && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      {comments.map((comment) => {
                        const commentAuthor = state.users.find(u => u.id === comment.authorId);
                        return (
                          <div key={comment.id} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                            <p className="text-gray-700 dark:text-gray-300">{comment.body}</p>
                            <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                              <span>{commentAuthor?.name}</span>
                              <span>•</span>
                              <span>{formatDate(comment.createdAt)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Comment Form */}
                  {showCommentForm === question.id && (
                    <div className="mt-4 space-y-2 border-t pt-4">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        className="min-h-[80px]"
                      />
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          onClick={() => handleSubmitComment(question.id, 'question')}
                          disabled={!commentText.trim()}
                        >
                          Add Comment
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowCommentForm(null);
                            setCommentText('');
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Answers */}
        {answers.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h2>
            
            {answers
              .sort((a, b) => {
                if (a.isAccepted && !b.isAccepted) return -1;
                if (!a.isAccepted && b.isAccepted) return 1;
                return b.votes - a.votes;
              })
              .map((answer, index) => {
                const answerAuthor = state.users.find(u => u.id === answer.authorId);
                const answerVote = getUserVote(answer.id);
                const answerComments = state.comments.filter(c => c.parentId === answer.id && c.parentType === 'answer');
                
                return (
                  <motion.div
                    key={answer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className={answer.isAccepted ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : ''}>
                      <CardContent className="p-6">
                        <div className="flex gap-6">
                          {/* Vote Column */}
                          <div className="flex flex-col items-center space-y-2 flex-shrink-0">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVoteAnswer(answer.id, 'up')}
                              className={`p-2 ${answerVote?.type === 'up' ? 'bg-green-100 text-green-600' : 'hover:bg-green-100 dark:hover:bg-green-900'}`}
                            >
                              <ChevronUp className="w-6 h-6" />
                            </Button>
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {answer.votes}
                            </span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVoteAnswer(answer.id, 'down')}
                              className={`p-2 ${answerVote?.type === 'down' ? 'bg-red-100 text-red-600' : 'hover:bg-red-100 dark:hover:bg-red-900'}`}
                            >
                              <ChevronDown className="w-6 h-6" />
                            </Button>
                            
                            {/* Accept Answer Button */}
                            {isAuthenticated && currentUser?.id === question.authorId && !answer.isAccepted && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleAcceptAnswer(answer.id)}
                                className="p-2 hover:bg-green-100 dark:hover:bg-green-900 mt-2"
                                title="Accept this answer"
                              >
                                <CheckCircle className="w-6 h-6 text-gray-400 hover:text-green-600" />
                              </Button>
                            )}
                            
                            {/* Accepted Badge */}
                            {answer.isAccepted && (
                              <div className="flex items-center space-x-1 text-green-600 mt-2">
                                <CheckCircle className="w-6 h-6 fill-current" />
                              </div>
                            )}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            {answer.isAccepted && (
                              <div className="flex items-center space-x-2 mb-4 text-green-600 font-medium">
                                <Award className="w-5 h-5" />
                                <span>Accepted Answer</span>
                              </div>
                            )}
                            
                            <div className="prose prose-sm max-w-none dark:prose-invert mb-4"
                                 dangerouslySetInnerHTML={{ __html: answer.body }} />

                            {/* Answer Meta */}
                            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 border-t pt-4">
                              <div className="flex items-center space-x-4">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>Answered {formatDate(answer.createdAt)}</span>
                                </div>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setShowCommentForm(showCommentForm === answer.id ? null : answer.id)}
                                  className="text-blue-600 hover:text-blue-700"
                                >
                                  <MessageCircle className="w-4 h-4 mr-1" />
                                  Add comment
                                </Button>
                              </div>
                              
                              <Link 
                                to={`/user/${answerAuthor?.id}`}
                                className="flex items-center space-x-2 hover:bg-gray-100 dark:hover:bg-gray-800 p-2 rounded"
                              >
                                <Avatar className="w-8 h-8">
                                  <AvatarImage src={answerAuthor?.avatar} />
                                  <AvatarFallback>
                                    {answerAuthor?.name?.charAt(0)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium text-gray-900 dark:text-white">
                                    {answerAuthor?.name}
                                  </p>
                                  <p className="text-xs">
                                    {answerAuthor?.reputation} reputation
                                  </p>
                                </div>
                              </Link>
                            </div>

                            {/* Answer Comments */}
                            {answerComments.length > 0 && (
                              <div className="mt-4 space-y-2 border-t pt-4">
                                {answerComments.map((comment) => {
                                  const commentAuthor = state.users.find(u => u.id === comment.authorId);
                                  return (
                                    <div key={comment.id} className="text-sm bg-gray-50 dark:bg-gray-800 p-3 rounded">
                                      <p className="text-gray-700 dark:text-gray-300">{comment.body}</p>
                                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                                        <span>{commentAuthor?.name}</span>
                                        <span>•</span>
                                        <span>{formatDate(comment.createdAt)}</span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}

                            {/* Answer Comment Form */}
                            {showCommentForm === answer.id && (
                              <div className="mt-4 space-y-2 border-t pt-4">
                                <Textarea
                                  value={commentText}
                                  onChange={(e) => setCommentText(e.target.value)}
                                  placeholder="Add a comment..."
                                  className="min-h-[80px]"
                                />
                                <div className="flex space-x-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSubmitComment(answer.id, 'answer')}
                                    disabled={!commentText.trim()}
                                  >
                                    Add Comment
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                      setShowCommentForm(null);
                                      setCommentText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
          </div>
        )}

        {/* Answer Form */}
        {isAuthenticated ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Your Answer
                </h3>
                
                <form onSubmit={handleSubmitAnswer} className="space-y-4">
                  <RichTextEditor
                    value={answerBody}
                    onChange={setAnswerBody}
                    placeholder="Write your answer here. Be clear and helpful!"
                    height="200px"
                  />
                  
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={isSubmitting || !answerBody.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Answer'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Sign in to post an answer
              </p>
              <Button onClick={() => navigate('/')}>
                Sign In
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}