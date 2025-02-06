export const CONTRACT_ADDRESSES = {
  COINFLIP: "0x23A6E549a28784b56c42390f0a0E406e653Ea37E",
  ELECTION: "0x4Cd08d14A03bC4F0c7a1D3Ef637de878e1A8b6a1",
  ELECTION_PREDICT: "0x476C9A10FB465c86b5E61A93C67a095De130aCb1"
};

export const ABIS = {
  ELECTION: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addDelegationCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addDesignerCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addDeveloperCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addResearcherCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "delegationCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "designerCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "developerCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "researcherCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "showDelegationVotes",
      "outputs": [{"internalType": "uint16[]","name": "","type": "uint16[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "showDesignerVotes",
      "outputs": [{"internalType": "uint16[]","name": "","type": "uint16[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "showDeveloperVotes",
      "outputs": [{"internalType": "uint16[]","name": "","type": "uint16[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "showResearcherVotes",
      "outputs": [{"internalType": "uint16[]","name": "","type": "uint16[]"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForDelegation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForDesigner",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForDeveloper",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForResearcher",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForMarketing",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "voteForEducation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addMarketingCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address","name": "candidate","type": "address"}],
      "name": "addEducationCandidate",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "marketingCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "uint256","name": "","type": "uint256"}],
      "name": "educationCandidates",
      "outputs": [{"internalType": "address","name": "","type": "address"}],
      "stateMutability": "view",
      "type": "function"
    },
    "function owners(uint256) external view returns (address)",
    "function getDelegationCandidates() external view returns (address[])",
    "function getDeveloperCandidates() external view returns (address[])",
    "function getDesignerCandidates() external view returns (address[])",
    "function getResearcherCandidates() external view returns (address[])",
    "function getMarketingCandidates() external view returns (address[])",
    "function getEducationCandidates() external view returns (address[])",
    "function getDelegationVotes() external view returns (uint256[])",
    "function getDeveloperVotes() external view returns (uint256[])",
    "function getDesignerVotes() external view returns (uint256[])",
    "function getResearcherVotes() external view returns (uint256[])",
    "function getMarketingVotes() external view returns (uint256[])",
    "function getEducationVotes() external view returns (uint256[])",
    "function isApplicationOpen() external view returns (bool)"
  ],
  COINFLIP: [
    {
      "inputs": [],
      "stateMutability": "nonpayable",
      "type": "constructor"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": true,
          "internalType": "address",
          "name": "player",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "betAmount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "playerGuess",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "outcome",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "win",
          "type": "bool"
        }
      ],
      "name": "BetResult",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "deposit",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bool",
          "name": "guess",
          "type": "bool"
        }
      ],
      "name": "flipCoin",
      "outputs": [
        {
          "internalType": "bool",
          "name": "win",
          "type": "bool"
        }
      ],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "stateMutability": "payable",
      "type": "receive"
    },
    {
      "inputs": [],
      "name": "owner",
      "outputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ],
  ELECTION_PREDICT: [
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "betForDelegation",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        }
      ],
      "name": "betForDeveloper",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        }
      ],
      "name": "betForDesigner",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        }
      ],
      "name": "betForResearcher",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeDelegationPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeDeveloperPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeDesignerPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeResearcherPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        }
      ],
      "name": "betForMarketing",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "candidate",
          "type": "address"
        }
      ],
      "name": "betForEducation",
      "outputs": [],
      "stateMutability": "payable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeMarketingPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "distributeEducationPrizes",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ],
  TOKEN: [
    "function approve(address spender, uint256 amount) external returns (bool)",
    "function transfer(address to, uint256 amount) external returns (bool)",
    "function balanceOf(address account) external view returns (uint256)",
    "function allowance(address owner, address spender) external view returns (uint256)"
  ]
}; 