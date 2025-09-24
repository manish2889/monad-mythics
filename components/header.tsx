'use client';

import { motion } from 'framer-motion';
import { PenSquare, BookOpen, FlaskConical, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React, { useState, useEffect } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { UserNav } from '@/components/user-nav';
import WalletConnect from '@/components/wallet-connect';
import { cn } from '@/lib/utils';

import { CreateStoryDialog } from './create-story-dialog';

// Type definitions for nav items
type NavSubItem = {
  href: string;
  label: string;
  icon?: React.ReactNode;
};

type NavItem = {
  href?: string;
  label: string;
  icon?: React.ReactNode;
  type?: 'link' | 'dropdown';
  items?: NavSubItem[];
};

export function Header() {
  const pathname = usePathname();
  const { account } = useWeb3();
  const { toast } = useToast();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Track scroll position for adding box shadow to header
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Define active class for navigation links
  const isActive = (path: string) => {
    if (path === '/community') {
      return pathname === '/community' || pathname === '/community/creators'
        ? 'bg-primary/10 text-primary font-medium'
        : 'hover:bg-accent/20 text-muted-foreground';
    }
    return pathname === path
      ? 'bg-primary/10 text-primary font-medium'
      : 'hover:bg-accent/20 text-muted-foreground';
  };

  const handleCreateClick = () => {
    // Check if user is authenticated
    const isAdmin =
      typeof window !== 'undefined' && window.localStorage
        ? localStorage.getItem('adminSession')
        : null;

    if (!account && !isAdmin) {
      toast({
        title: 'Authentication Required',
        description:
          'Please connect your wallet or login as admin to create stories',
        variant: 'destructive',
      });
      return;
    }
    setShowCreateDialog(true);
  };

  const navItems: NavItem[] = [
    // { type: 'link', href: '/genres', label: 'Genres' },
    // {
    //   type: 'dropdown',
    //   label: 'Community',
    //   icon: <Users className="h-4 w-4 mr-1.5 colorful-icon" />,
    //   items: [
    //     { href: '/community', label: 'Community Hub' },
    //     {
    //       href: '/community/creators',
    //       label: 'Top Creators',
    //       icon: <Trophy className="h-4 w-4 mr-1.5 colorful-icon" />,
    //     },
    //   ],
    // },
    // { type: 'link', href: '/nft-gallery', label: 'NFT Gallery' },
    // { type: 'link', href: '/nft-marketplace', label: 'NFT Marketplace' },
  ];

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'border-b border-white/5 backdrop-blur-[12px] sticky top-0 z-50 transition-all duration-300 comic-text',
        'bg-background/25',
        scrolled && 'shadow-lg shadow-black/5 bg-background/30'
      )}
    >
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center">
          <Link
            href="/"
            className="flex items-center space-x-2 mr-6 group relative"
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              className="w-9 h-9 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center doodle-wiggle"
            >
              <BookOpen className="w-5 h-5 text-primary" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-orange-400 via-red-500 to-pink-500 bg-clip-text text-transparent doodle-heading comic-text-bold">
              Monad Mythics
            </span>
          </Link>

          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item, index) => (
              <motion.div
                key={
                  item.type === 'dropdown'
                    ? `dropdown-${item.label}`
                    : item.href || `item-${index}`
                }
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 + 0.1, duration: 0.2 }}
                whileHover={{ scale: 1.03 }}
                className="inline-flex items-center comic-text"
              >
                {item.type === 'dropdown' ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center text-foreground/90 hover:text-foreground hover:bg-white/5 backdrop-blur-sm comic-pop comic-text`}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className="ml-1 h-3 w-3" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-background/70 backdrop-blur-lg border-white/10">
                      {item.items?.map((subItem) => (
                        <DropdownMenuItem key={subItem.href} asChild>
                          <Link
                            href={subItem.href}
                            className="flex items-center w-full text-foreground/90 hover:text-foreground hover:bg-white/5 comic-text"
                          >
                            {subItem.icon && subItem.icon}
                            {subItem.label}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : item.href ? (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-sm rounded-md transition-all duration-200 flex items-center text-foreground/90 hover:text-foreground hover:bg-white/5 backdrop-blur-sm comic-pop comic-text`}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                ) : null}
              </motion.div>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-3">
          <WalletConnect />
          {pathname !== '/create/ai-story' && (
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex bg-orange-500/20 hover:bg-orange-500/30 text-orange-500 backdrop-blur-sm comic-text-bold border-orange-500/20 btn-spring"
              asChild
            >
              <Link href="/create/ai-story">
                <PenSquare className="h-4 w-4 mr-2" />
                Create
              </Link>
            </Button>
          )}
          <UserNav />
        </div>
      </div>

      <CreateStoryDialog
        isOpen={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
      />
    </motion.header>
  );
}
