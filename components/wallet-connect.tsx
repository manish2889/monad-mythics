'use client';

import {
  Wallet,
  ChevronDown,
  Copy,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import React, { useState, useCallback } from 'react';

import { useWeb3 } from '@/components/providers/web3-provider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/components/ui/use-toast';

/**
 * WalletConnect Component
 *
 * A comprehensive wallet connection component that provides:
 * - Wallet connection/disconnection functionality
 * - Account display with ENS support
 * - Network information and switching
 * - Balance display
 * - Address copying and blockchain explorer links
 * - Responsive design with tooltips and animations
 *
 * @returns JSX.Element - The wallet connection component
 */
export default function WalletConnect() {
  const {
    account,
    chainId,
    balance,
    connected,
    connecting,
    connectWallet,
    disconnectWallet,
    networkName,
    ensName,
  } = useWeb3();

  const { toast } = useToast();
  const [showDropdown, setShowDropdown] = useState(false);
  const [copyTooltip, setCopyTooltip] = useState('Click to copy');

  /**
   * Formats wallet address for display
   * @param address - The wallet address to format
   * @returns Formatted address string
   */
  const formatAddress = useCallback((address: string | null) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  /**
   * Copies wallet address to clipboard
   */
  const copyAddressToClipboard = useCallback(async () => {
    if (!account) return;

    try {
      await navigator.clipboard.writeText(account);
      setCopyTooltip('Copied!');
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });

      setTimeout(() => setCopyTooltip('Click to copy'), 2000);
    } catch (error) {
      toast({
        title: 'Copy Failed',
        description: 'Failed to copy address to clipboard',
        variant: 'destructive',
      });
    }
  }, [account, toast]);

  /**
   * Opens blockchain explorer for the connected account
   */
  const viewOnExplorer = useCallback(() => {
    if (!account || !chainId) return;

    const explorerUrls: Record<number, string> = {
      10143: 'https://testnet.monadexplorer.com',
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      8453: 'https://basescan.org',
      42161: 'https://arbiscan.io',
      10: 'https://optimistic.etherscan.io',
    };

    const explorerUrl = explorerUrls[chainId] || 'https://etherscan.io';
    window.open(`${explorerUrl}/address/${account}`, '_blank');
  }, [account, chainId]);

  // Show connect button if not connected
  if (!connected) {
    return (
      <Button
        onClick={connectWallet}
        disabled={connecting}
        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-medium transition-all duration-300 shadow-lg hover:shadow-xl border-0 backdrop-blur-sm"
      >
        {connecting ? (
          <>
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            <span>Connecting...</span>
          </>
        ) : (
          <>
            <Wallet className="h-4 w-4" />
            <span>Connect Wallet</span>
          </>
        )}
      </Button>
    );
  }

  // Show connected wallet interface
  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              role="button"
              tabIndex={0}
              onClick={() => setShowDropdown(!showDropdown)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowDropdown(!showDropdown);
                }
              }}
              className="flex items-center gap-3 px-4 py-2 rounded-lg bg-slate-900/80 border border-emerald-500/30 text-white hover:bg-slate-800/80 hover:border-emerald-400/50 text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-emerald-400/20 transition-all duration-300 backdrop-blur-sm"
              aria-haspopup="true"
              aria-expanded={showDropdown ? 'true' : 'false'}
            >
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shadow-lg shadow-emerald-400/50" />
                <span className="text-emerald-300 text-xs font-medium">
                  {networkName || 'Ethereum'}
                </span>
              </div>
              <div className="h-4 w-px bg-slate-600" />
              <span className="text-white font-mono">
                {ensName || formatAddress(account)}
              </span>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Connected to {networkName || 'Ethereum'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Dropdown Menu */}
      <DropdownMenu open={showDropdown} onOpenChange={setShowDropdown}>
        <DropdownMenuTrigger className="sr-only" aria-hidden="true">
          Open menu
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          side="bottom"
          sideOffset={4}
          className="w-72 bg-slate-900/95 border-slate-700/50 backdrop-blur-lg"
        >
          {/* Account Info */}
          <div className="px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 ring-2 ring-emerald-500/30">
                <AvatarImage
                  src={`https://api.dicebear.com/7.x/identicon/svg?seed=${account}`}
                />
                <AvatarFallback className="bg-slate-800 text-emerald-400 font-bold">
                  {account?.slice(2, 4).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white font-mono">
                  {ensName || formatAddress(account)}
                </p>
                <p className="text-xs text-emerald-400 font-medium">
                  {balance} {chainId === 10143 ? 'MON' : 'ETH'}
                </p>
              </div>
            </div>
          </div>

          {/* Network Info */}
          <div className="px-4 py-3 border-b border-slate-700/50 bg-slate-800/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-slate-300">Network</span>
              </div>
              <span className="text-xs font-medium text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-md">
                {networkName || 'Ethereum'}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="p-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuItem
                    onClick={copyAddressToClipboard}
                    className="text-slate-300 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
                  >
                    <Copy className="mr-3 h-4 w-4 text-slate-400" />
                    Copy Address
                  </DropdownMenuItem>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{copyTooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuItem
              onClick={viewOnExplorer}
              className="text-slate-300 hover:text-white hover:bg-slate-800/50 cursor-pointer transition-colors duration-200"
            >
              <ExternalLink className="mr-3 h-4 w-4 text-slate-400" />
              View on Explorer
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-slate-700/50 my-2" />

            <DropdownMenuItem
              onClick={disconnectWallet}
              className="text-red-400 hover:text-red-300 hover:bg-red-500/10 cursor-pointer transition-colors duration-200"
            >
              <AlertCircle className="mr-3 h-4 w-4" />
              Disconnect Wallet
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
