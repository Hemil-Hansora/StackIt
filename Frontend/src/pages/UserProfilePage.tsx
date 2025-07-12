import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Edit, 
  Trophy, 
  MessageSquare, 
  CheckCircle,
  Crown,
  Settings,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import Layout from '../components/Layout';
import QuestionCard from '../components/QuestionCard';
import { useApp } from '../context/AppContext';
import { useAuth } from '../hooks/useAuth';

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { state } = useApp();
  const { currentUser, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
    avatar: ''
  });

  const user = state.users.find(u => u.id === id);
  const isOwnProfile = currentUser?.id === id;

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            User Not Found
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            The user profile you're looking for doesn't exist.
          </p>
          <Button asChild>
            <Link to="/">Back to Questions</Link>
          </Button>
        </div>
      </Layout>
    );
  }

  const userQuestions = state.questions.filter(q => q.authorId === user.id);
  const userAnswers = state.answers.filter(a => a.authorId === user.id);
  const acceptedAnswers = userAnswers.filter(a => a.isAccepted);
  const totalVotes = userQuestions.reduce((sum, q) => sum + q.votes, 0) + 
                   userAnswers.reduce((sum, a) => sum + a.votes, 0);

  const handleEditProfile = () => {
    setEditForm({
      name: user.name,
      bio: user.bio,
      avatar: user.avatar
    });
    setIsEditing(true);
  };

  const handleSaveProfile = () => {
    updateProfile(editForm);
    setIsEditing(false);
  };

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      // In a real app, this would call an API to delete the account
      alert('Account deletion is not implemented in this demo.');
    }
  };

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="w-32 h-32 mb-4">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="text-4xl">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  
                  {isOwnProfile && (
                    <div className="flex gap-2">
                      <Button onClick={handleEditProfile} size="sm">
                        <Edit className="w-4 h-4 mr-2" />
                        Edit Profile
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm">
                            <Settings className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Account Settings</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="p-4 border border-red-200 rounded-lg">
                              <h3 className="font-semibold text-red-600 mb-2">Danger Zone</h3>
                              <p className="text-sm text-gray-600 mb-3">
                                Once you delete your account, there is no going back. Please be certain.
                              </p>
                              <Button 
                                variant="destructive" 
                                onClick={handleDeleteAccount}
                                className="w-full"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete Account
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                      {user.name}
                    </h1>
                    //@ts-ignore
                    {user.role === 'admin' && (
                        //@ts-ignore
                      <Crown className="w-6 h-6 text-yellow-500"   title="Administrator" />
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-600 dark:text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>Joined {new Date(user.joinDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Trophy className="w-4 h-4" />
                      <span>{user.reputation} reputation</span>
                    </div>
                  </div>

                  {user.bio && (
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      {user.bio}
                    </p>
                  )}

                  {/* Badges */}
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">Badges</h3>
                    <div className="flex flex-wrap gap-2">
                      {user.badges.length > 0 ? (
                        user.badges.map((badge) => (
                          <Badge
                            key={badge.id}
                            className={`${badge.color} text-white`}
                            title={badge.description}
                          >
                            {badge.icon} {badge.name}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500">No badges earned yet</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {userQuestions.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Questions</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                {userAnswers.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Answers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {acceptedAnswers.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Accepted</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-2xl font-bold text-orange-600 dark:text-orange-400 mb-2">
                {totalVotes}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Votes</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          {/* Recent Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="w-5 h-5" />
                <span>Recent Questions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userQuestions.length > 0 ? (
                <div className="space-y-4">
                  {userQuestions.slice(0, 5).map((question) => (
                    <div key={question.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                      <Link 
                        to={`/q/${question.id}`}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                      >
                        {question.title}
                      </Link>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                        <span>{question.votes} votes</span>
                        <span>{question.answerCount} answers</span>
                        <span>{question.views} views</span>
                        {question.acceptedAnswerId && (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No questions posted yet</p>
              )}
            </CardContent>
          </Card>

          {/* Recent Answers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5" />
                <span>Recent Answers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userAnswers.length > 0 ? (
                <div className="space-y-4">
                  {userAnswers.slice(0, 5).map((answer) => {
                    const question = state.questions.find(q => q.id === answer.questionId);
                    return (
                      <div key={answer.id} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-b-0">
                        <Link 
                          to={`/q/${answer.questionId}`}
                          className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                        >
                          {question?.title}
                        </Link>
                        <div className="flex items-center gap-4 mt-1 text-sm text-gray-500">
                          <span>{answer.votes} votes</span>
                          {answer.isAccepted && (
                            <span className="text-green-600 flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" />
                              Accepted
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-gray-500">No answers posted yet</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* All Questions */}
        {userQuestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              All Questions ({userQuestions.length})
            </h2>
            <div className="space-y-4">
              {userQuestions.map((question, index) => (
                <QuestionCard key={question.id} question={question} index={index} />
              ))}
            </div>
          </motion.div>
        )}

        {/* Edit Profile Dialog */}
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={editForm.bio}
                  onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                  placeholder="Tell us about yourself..."
                />
              </div>
              <div>
                <Label htmlFor="avatar">Avatar URL</Label>
                <Input
                  id="avatar"
                  value={editForm.avatar}
                  onChange={(e) => setEditForm(prev => ({ ...prev, avatar: e.target.value }))}
                  placeholder="https://example.com/avatar.jpg"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveProfile}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}