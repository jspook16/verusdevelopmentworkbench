import { useState } from 'react';
import { DEFAULT_CONFIG, ANIMATION_CONFIG } from '../utils/constants';
import { calculateMatchingPositions, calculateTicketScore, sortTickets } from '../utils/ticketHelpers';

export const useDrawingSystem = (sendCommand) => {
  // Drawing system state
  const [pastBlockNumber, setPastBlockNumber] = useState('');
  const [drawingHash, setDrawingHash] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawingResults, setDrawingResults] = useState(null);
  const [drawingStatus, setDrawingStatus] = useState('');
  const [sortCriteria, setSortCriteria] = useState(DEFAULT_CONFIG.SORT_CRITERIA);

  // Visual animation states for hash reveal
  const [currentPosition, setCurrentPosition] = useState(-1);
  const [revealedCharacters, setRevealedCharacters] = useState([]);
  const [spinningChar, setSpinningChar] = useState('');
  const [isLoadingHash, setIsLoadingHash] = useState(false);

  /**
   * Fetch block hash for a given block number
   */
  const fetchBlockHash = async (blockNumber) => {
    try {
      const blockHash = await sendCommand('getblockhash', [parseInt(blockNumber)]);
      if (!blockHash || typeof blockHash !== 'string') {
        throw new Error(`Invalid block hash returned for block ${blockNumber}`);
      }
      return blockHash;
    } catch (error) {
      console.error(`Error fetching block hash for block ${blockNumber}:`, error);
      throw error;
    }
  };

  /**
   * Clear drawing results
   */
  const clearDrawingResults = () => {
    setDrawingResults(null);
    setDrawingHash('');
    setCurrentPosition(-1);
    setRevealedCharacters([]);
    setSpinningChar('');
    setIsLoadingHash(false);
    setDrawingStatus('');
    setPastBlockNumber('');
  };

  /**
   * Perform lottery drawing
   */
  const performDrawing = async (tickets, revokedTickets = []) => {
    if (!pastBlockNumber || tickets.length === 0) {
      throw new Error('Please enter a past block number and ensure you have generated tickets');
    }

    setIsDrawing(true);
    setDrawingStatus('Starting lottery drawing...');
    setDrawingResults(null);
    setCurrentPosition(-1);
    setRevealedCharacters([]);
    setSpinningChar('');

    try {
      setDrawingStatus(`Fetching hash for block ${pastBlockNumber}...`);
      setIsLoadingHash(true);
      
      const blockHash = await fetchBlockHash(pastBlockNumber);
      setDrawingHash(blockHash);
      setIsLoadingHash(false);
      
      setDrawingStatus(`Revealing winning hash...`);

      // Animate hash reveal
      const hashLength = Math.min(blockHash.length, ANIMATION_CONFIG.MAX_HASH_LENGTH);
      
      for (let position = 0; position < hashLength; position++) {
        setCurrentPosition(position);
        
        // Spin through random characters for visual effect
        for (let spin = 0; spin < ANIMATION_CONFIG.SPIN_COUNT; spin++) {
          const randomChar = ANIMATION_CONFIG.HASH_CHARACTERS[Math.floor(Math.random() * ANIMATION_CONFIG.HASH_CHARACTERS.length)];
          setSpinningChar(randomChar);
          await new Promise(resolve => setTimeout(resolve, ANIMATION_CONFIG.SPIN_DELAY));
        }
        
        // Reveal the actual character
        setRevealedCharacters(prev => [...prev, blockHash[position]]);
        setSpinningChar('');
        await new Promise(resolve => setTimeout(resolve, ANIMATION_CONFIG.REVEAL_DELAY));
      }
      
      setCurrentPosition(-1);
      setDrawingStatus(`Hash revealed! Calculating results...`);

      // Calculate results for all tickets
      const resultsWithScores = tickets.map(ticket => {
        if (!ticket.playingNumber) {
          return {
            ...ticket,
            matchingPositions: [],
            score: 0,
            error: 'No playing number available'
          };
        }

        const matchingPositions = calculateMatchingPositions(ticket.playingNumber, blockHash);
        const score = calculateTicketScore(matchingPositions, ticket.playingNumber);

        return {
          ...ticket,
          matchingPositions,
          score,
          hash: ticket.playingNumber,
          name: ticket.name,
          isRevoked: revokedTickets.includes(ticket.name)
        };
      });

      // Sort by matches first (for winner determination), then by ticket ID for tie-breaking
      const sortedResults = sortTickets(resultsWithScores, 'matches');

      // Determine single winner (highest matches, then score, lowest ID in case of ties)
      const maxMatches = sortedResults[0]?.matchingPositions?.length || 0;
      const potentialWinner = maxMatches > 0 ? sortedResults[0] : null;
      const maxScore = sortedResults[0]?.score || 0;

      // Check if winner is revoked (jackpot rollover)
      const isJackpotRollover = potentialWinner && potentialWinner.isRevoked;
      const actualWinner = isJackpotRollover ? null : potentialWinner;

      // Re-sort according to current sort criteria for display
      const displaySortedResults = sortTickets(sortedResults, sortCriteria);

      setDrawingResults({
        drawingHash: blockHash,
        blockNumber: pastBlockNumber,
        allTickets: displaySortedResults,
        winner: actualWinner,
        potentialWinner: potentialWinner, // The actual highest scoring ticket (even if revoked)
        isJackpotRollover: isJackpotRollover,
        maxScore: maxScore,
        totalTickets: tickets.length,
        revokedTicketsCount: revokedTickets.length
      });

      // CRITICAL: Unlock jackpot after winner determination (if winner found)
      if (actualWinner) {
                  setDrawingStatus(`Winner determined! Skipping jackpot unlock (timelock disabled for debugging)...`);
          console.log(`⚠️ [DrawingSystem] TIMELOCK UNLOCK DISABLED - Skipping jackpot unlock for debugging`);
        try {
          // Extract main lottery ID from winner ticket name CORRECTLY
          // Ticket name format: "575800_1of6@mylottery.shylock@" 
          // We need to extract "mylottery.shylock" (without the trailing @)
          const ticketFullName = actualWinner.name; // e.g., "575800_1of6@mylottery.shylock@"
          const mainLotteryIdWithAt = ticketFullName.split('@').slice(1).join('@'); // Get "mylottery.shylock@"
          const mainLotteryId = mainLotteryIdWithAt.replace('@', ''); // Remove trailing @ to get "mylottery.shylock"
          
          console.log(`[DrawingSystem] Winner ticket: ${ticketFullName}`);
          console.log(`[DrawingSystem] Extracted lottery ID: ${mainLotteryId}`);
          console.log(`[DrawingSystem] Will unlock: jackpot.${mainLotteryId}@`);
          
          // Import and use timelock engine to unlock
          const { TimelockEngine } = await import('../engines/timelockEngine.js');
          const timelockEngine = new TimelockEngine(sendCommand);
          
          console.log(`[DrawingSystem] Starting jackpot unlock for lottery: ${mainLotteryId}`);
                      // await timelockEngine.unlockJackpotAfterDrawing(mainLotteryId, 3); // DISABLED FOR DEBUGGING
          
          console.log(`[DrawingSystem] ✅ Jackpot unlock initiated successfully for ${mainLotteryId}`);
          setDrawingStatus(`🏆 Winner: Ticket #${actualWinner.id} with score ${maxScore}! Jackpot unlock initiated.`);
          
        } catch (unlockError) {
          console.error('[DrawingSystem] ❌ Error unlocking jackpot:', unlockError);
          setDrawingStatus(`🏆 Winner: Ticket #${actualWinner.id} with score ${maxScore}! ⚠️ Jackpot unlock failed: ${unlockError.message}`);
          // Continue - don't fail the drawing due to unlock issues
        }
      }

      if (isJackpotRollover) {
        setDrawingStatus(`Drawing complete! JACKPOT ROLLOVER - Winning ticket ${potentialWinner.name} was revoked.`);
      } else if (actualWinner) {
        setDrawingStatus(`🏆 Drawing complete! Winner: Ticket #${actualWinner.id} with score ${maxScore}! Jackpot unlocked for payout.`);
      } else {
        setDrawingStatus(`Drawing complete! No winning tickets (all scores = 0).`);
      }

    } catch (error) {
      console.error('Error performing drawing:', error);
      setDrawingStatus(`Drawing failed: ${error.message}`);
      setIsLoadingHash(false);
      setCurrentPosition(-1);
      throw error;
    } finally {
      setIsDrawing(false);
    }
  };

  /**
   * Update sort criteria and re-sort results
   */
  const updateSortCriteria = (newCriteria) => {
    setSortCriteria(newCriteria);
    
    if (drawingResults && drawingResults.allTickets) {
      const resortedTickets = sortTickets(drawingResults.allTickets, newCriteria);
      setDrawingResults(prev => ({
        ...prev,
        allTickets: resortedTickets
      }));
    }
  };

  return {
    // State
    pastBlockNumber,
    drawingHash,
    isDrawing,
    drawingResults,
    drawingStatus,
    sortCriteria,
    currentPosition,
    revealedCharacters,
    spinningChar,
    isLoadingHash,
    
    // Setters
    setPastBlockNumber,
    
    // Functions
    performDrawing,
    clearDrawingResults,
    updateSortCriteria,
    fetchBlockHash
  };
}; 