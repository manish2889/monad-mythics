'use client';

import { motion } from 'framer-motion';
import {
  Heart,
  MessageSquare,
  Share2,
  Sparkles,
  PenSquare,
  ArrowUpRight,
  Eye,
} from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface StoryAuthor {
  name: string;
  avatar?: string;
  username?: string;
}
interface Story {
  id: string;
  title: string;
  content?: string;
  author: string | StoryAuthor;
  authorAvatar?: string;
  authorUsername?: string;
  likes?: number;
  views?: number;
  comments?: number;
  coverImage?: string;
  image?: string;
  description?: string;
  price?: string;
  isTop10?: boolean;
  genre?: string;
}
interface StoryCardProps {
  story: Story;
  viewMode?: 'grid' | 'list';
  hideLink?: boolean;
  showCreateButton?: boolean;
}

export function StoryCard({
  story,
  viewMode = 'grid',
  hideLink = false,
  showCreateButton = false,
}: StoryCardProps) {
  const router = useRouter();

  // Extract author information
  const authorName =
    typeof story.author === 'string'
      ? story.author
      : story.author?.name || 'Anonymous';
  const authorAvatar =
    typeof story.author === 'string'
      ? story.authorAvatar
      : story.author?.avatar || story.authorAvatar;
  const storyContent =
    story.content || story.description || 'No content available';
  const isGrid = viewMode === 'grid';

  const handleViewNFT = () => {
    router.push(`/story/${story.id}`);
  };

  const handleCreateSimilar = () => {
    router.push(`/create?similar=${story.id}`);
  };

  const cardContent = (
    <>
      <div className="relative">
        {story.coverImage || story.image ? (
          <div className="relative h-48 overflow-hidden rounded-t-lg">
            <img
              src={story.coverImage || story.image}
              alt={story.title}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300 bg-black/40">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-black px-3 py-1.5 rounded-lg text-sm font-medium flex items-center"
                onClick={handleViewNFT}
              >
                View NFT <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
              </motion.button>
            </div>
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-amber-100 to-orange-200 dark:from-amber-900/20 dark:to-orange-900/20 rounded-t-lg flex items-center justify-center">
            <Sparkles className="h-12 w-12 text-amber-600 dark:text-amber-400" />
          </div>
        )}
      </div>

      <div className="flex-1">
        <CardHeader className="p-4 pb-2">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={authorAvatar} />
              <AvatarFallback>{authorName?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-medium">{authorName}</p>
          </div>
          <h3 className="text-lg font-semibold mt-2 line-clamp-2 group-hover:text-amber-800 dark:group-hover:text-amber-300 text-gray-800 dark:text-white transition-colors duration-200">
            {story.title}
          </h3>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <p className="text-gray-700 dark:text-muted-foreground text-sm line-clamp-2">
            {storyContent}
          </p>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between">
          <div className="flex space-x-4 text-sm text-gray-600 dark:text-muted-foreground">
            <div className="flex items-center">
              <Heart className="h-3.5 w-3.5 mr-1" />
              {story.likes || 0}
            </div>
            {story.views && (
              <div className="flex items-center">
                <Eye className="h-3.5 w-3.5 mr-1" />
                {story.views}
              </div>
            )}
            {story.comments !== undefined && (
              <div className="flex items-center">
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                {story.comments}
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {story.genre && (
              <span className="text-xs bg-amber-100 dark:bg-muted px-2 py-1 rounded-full text-gray-800 dark:text-white">
                {story.genre}
              </span>
            )}
            {showCreateButton && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                title="Create Similar Story"
                onClick={handleCreateSimilar}
              >
                <PenSquare className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </CardFooter>
      </div>
    </>
  );

  return (
    <motion.div
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      }}
      transition={{ duration: 0.2 }}
      className="nft-pulse"
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-200 hover:shadow-md group',
          isGrid ? 'h-full' : 'flex gap-4'
        )}
      >
        {hideLink ? (
          <div className="block">{cardContent}</div>
        ) : (
          <div className="block cursor-pointer" onClick={handleViewNFT}>
            {cardContent}
          </div>
        )}
      </Card>
    </motion.div>
  );
}
// Default export for backward compatibility
export default StoryCard;
