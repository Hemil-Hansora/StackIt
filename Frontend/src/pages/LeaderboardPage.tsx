import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Star, Crown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Badge } from '../components/ui/badge';
import Layout from '../components/Layout';
import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function LeaderboardPage() {
  const { state } = useApp();
  
  const sortedUsers = [...state.users].sort((a, b) => b.reputation - a.reputation);
  const topUsers = sortedUsers.slice(0, 10);

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Award className="w-6 h-6 text-amber-600" />;
      default:
        return <Star className="w-6 h-6 text-blue-500" />;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-yellow-600';
      case 2:
        return 'bg-gradient-to-r from-gray-300 to-gray-500';
      case 3:
        return 'bg-gradient-to-r from-amber-400 to-amber-600';
      default:
        return 'bg-gradient-to-r from-blue-400 to-blue-600';
    }
  };

  const getUserStats = (userId: string) => {
    const userQuestions = state.questions.filter(q => q.authorId === userId);
    const userAnswers = state.answers.filter(a => a.authorId === userId);
    const acceptedAnswers = userAnswers.filter(a => a.isAccepted);
    
    return {
      questions: userQuestions.length,
      answers: userAnswers.length,
      acceptedAnswers: acceptedAnswers.length
    };
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community Leaderboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Top contributors ranked by reputation points
          </p>
        </motion.div>

        {/* Top 3 Podium */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
        >
          {topUsers.slice(0, 3).map((user, index) => {
            const rank = index + 1;
            const stats = getUserStats(user.id);
            
            return (
              <Card key={user.id} className={`relative overflow-hidden ${rank === 1 ? 'md:order-2 transform md:scale-105' : rank === 2 ? 'md:order-1' : 'md:order-3'}`}>
                <div className={`h-2 ${getRankColor(rank)}`} />
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center mb-4">
                    {getRankIcon(rank)}
                  </div>
                  <Link to={`/user/${user.id}`} className="block hover:opacity-80 transition-opacity">
                    <Avatar className="w-20 h-20 mx-auto mb-4">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback className="text-2xl">
                        {user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 flex items-center justify-center">
                      {user.name}
                      {user.role === 'admin' && (
                        <Crown className="w-4 h-4 ml-1 text-yellow-500" />
                      )}
                    </h3>
                  </Link>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-3">
                    {user.reputation.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    reputation points
                  </p>
                  <div className="text-xs text-gray-500 mb-3">
                    <p>{stats.questions} questions • {stats.answers} answers</p>
                    <p>{stats.acceptedAnswers} accepted</p>
                  </div>
                  <div className="flex flex-wrap justify-center gap-1">
                    {user.badges.slice(0, 3).map((badge) => (
                      <Badge key={badge.id} variant="secondary" className="text-xs">
                        {badge.icon} {badge.name}
                      </Badge>
                    ))}
                    {user.badges.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{user.badges.length - 3}
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </motion.div>

        {/* Full Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5 text-yellow-500" />
                <span>Top 10 Contributors</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="space-y-0">
                {topUsers.map((user, index) => {
                  const rank = index + 1;
                  const stats = getUserStats(user.id);
                  
                  return (
                    <motion.div
                      key={user.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 font-bold text-gray-900 dark:text-white">
                          {rank}
                        </div>
                        <Link to={`/user/${user.id}`} className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                          <Avatar className="w-12 h-12">
                            <AvatarImage src={user.avatar} />
                            <AvatarFallback>
                              {user.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                              {user.name}
                              {user.role === 'admin' && (
                                <Crown className="w-3 h-3 ml-1 text-yellow-500" />
                              )}
                            </h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Member since {new Date(user.joinDate).toLocaleDateString()}
                            </p>
                            <p className="text-xs text-gray-500">
                              {stats.questions} questions • {stats.answers} answers • {stats.acceptedAnswers} accepted
                            </p>
                          </div>
                        </Link>
                      </div>
                      
                      <div className="flex items-center space-x-6">
                        <div className="text-right">
                          <p className="text-lg font-bold text-blue-600 dark:text-blue-400">
                            {user.reputation.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            reputation
                          </p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">
                            {user.badges.length}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            badges
                          </p>
                        </div>
                        
                        <div className="hidden sm:block">
                          {getRankIcon(rank)}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Stats Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                {state.users.length}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Members</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-2">
                {state.users.reduce((sum, user) => sum + user.reputation, 0).toLocaleString()}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Reputation</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
                {state.users.reduce((sum, user) => sum + user.badges.length, 0)}
              </div>
              <p className="text-gray-600 dark:text-gray-400">Total Badges</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </Layout>
  );
}