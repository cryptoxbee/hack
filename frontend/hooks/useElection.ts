import { useState, useCallback } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESSES, ABIS } from '@/config/contracts';

type CandidateType = 'delegation' | 'developer' | 'designer' | 'researcher';

export const useElection = (provider: any) => {
  const [loading, setLoading] = useState(false);

  const getCandidates = useCallback(async (type: CandidateType) => {
    if (!provider) return [];

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const candidates: string[] = [];
      let i = 0;
      while (true) {
        try {
          const candidate = await contract[`${type}Candidates`](i);
          if (candidate === ethers.constants.AddressZero) break;
          candidates.push(candidate);
          i++;
        } catch (error) {
          break;
        }
      }
      return candidates;
    } catch (error) {
      console.error(`Error fetching ${type} candidates:`, error);
      return [];
    }
  }, [provider]);

  const getVotes = useCallback(async (type: CandidateType) => {
    if (!provider) return [];

    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        provider
      );

      const votes = await contract[`show${type.charAt(0).toUpperCase() + type.slice(1)}Votes`]();
      return votes.map((v: any) => v.toNumber());
    } catch (error) {
      console.error(`Error fetching ${type} votes:`, error);
      return [];
    }
  }, [provider]);

  const vote = useCallback(async (
    type: CandidateType,
    candidateAddress: string,
    signer: ethers.Signer
  ) => {
    setLoading(true);
    try {
      const contract = new ethers.Contract(
        CONTRACT_ADDRESSES.ELECTION,
        ABIS.ELECTION,
        signer
      );

      const tx = await contract[`voteFor${type.charAt(0).toUpperCase() + type.slice(1)}`](candidateAddress);
      await tx.wait();
      return true;
    } catch (error) {
      console.error("Error voting:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    getCandidates,
    getVotes,
    vote
  };
}; 