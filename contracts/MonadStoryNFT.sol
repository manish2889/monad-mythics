// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract MonadStoryNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIdCounter;

    // Base URI for metadata
    string private _baseURIextended;

    // Minting price
    uint256 public mintPrice = 0.001 ether;

    // Maximum supply
    uint256 public constant MAX_SUPPLY = 10000;

    // Mapping from token ID to story content hash (IPFS CID or similar)
    mapping(uint256 => string) private _storyContent;
    
    // Mapping from token ID to image count
    mapping(uint256 => uint256) private _imageCount;
    
    // Mapping from token ID to content type (0 = text only, 1 = text + images)
    mapping(uint256 => uint8) private _contentType;

    event StoryMinted(uint256 indexed tokenId, address indexed owner, string storyHash, string metadataURI, uint256 imageCount, uint8 contentType);

    constructor() ERC721("Monad Mythics Story NFT", "MMYTH") Ownable(msg.sender) {
        _baseURIextended = "ipfs://";
    }

    function setBaseURI(string memory baseURI_) external onlyOwner {
        _baseURIextended = baseURI_;
    }

    function _baseURI() internal view virtual override returns (string memory) {
        return _baseURIextended;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        mintPrice = newPrice;
    }

    function mintStory(string memory storyHash, string memory metadataURI, uint256 imageCount) 
        public 
        payable 
        returns (uint256)
    {
        require(msg.value >= mintPrice, "Insufficient payment for minting");
        uint256 tokenId = _tokenIdCounter.current();
        require(tokenId < MAX_SUPPLY, "Maximum supply reached");

        _tokenIdCounter.increment();
        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, metadataURI);
        _storyContent[tokenId] = storyHash;
        _imageCount[tokenId] = imageCount;
        _contentType[tokenId] = imageCount > 0 ? 1 : 0;

        emit StoryMinted(tokenId, msg.sender, storyHash, metadataURI, imageCount, _contentType[tokenId]);

        return tokenId;
    }

    function getStoryContent(uint256 tokenId) public view returns (string memory) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _storyContent[tokenId];
    }
    
    function getImageCount(uint256 tokenId) public view returns (uint256) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _imageCount[tokenId];
    }
    
    function getContentType(uint256 tokenId) public view returns (uint8) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return _contentType[tokenId];
    }
    
    function getStoryDetails(uint256 tokenId) public view returns (string memory storyHash, uint256 imageCount, uint8 contentType) {
        require(ownerOf(tokenId) != address(0), "Token does not exist");
        return (_storyContent[tokenId], _imageCount[tokenId], _contentType[tokenId]);
    }

    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        payable(owner()).transfer(balance);
    }

    // The following functions are overrides required by Solidity.

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    receive() external payable {}
} 