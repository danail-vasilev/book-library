// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "./Ownable.sol";

contract BookLibrary is Ownable {
    // Quantiy of books must be visible to users
    mapping(uint => uint) public bookIdToQuantity;
    mapping(address => uint[]) private borrowerToBookIds;
    address[] allBorrowers;

    function addBook(uint _id, uint quantity) external onlyOwner {
        bookIdToQuantity[_id] += quantity;
    }

    function listBorrowers() external view returns (address[] memory) {
        return allBorrowers;
    }

    function borrowBook(uint _bookId) external bookAvailable(_bookId) {
        require(
            !isBookBorrowed(borrowerToBookIds[msg.sender], _bookId),
            "You have already borrowed this book!"
        );
        // Remove book from the lib
        bookIdToQuantity[_bookId]--;
        // Add book to the borrower
        borrowerToBookIds[msg.sender].push(_bookId);
        // TODO check for duplicate before adding;
        // TODO check for a better solution/struct something like set.
        allBorrowers.push(msg.sender);
    }

    modifier bookAvailable(uint _id) {
        require(bookIdToQuantity[_id] > 0, "This book is not available");
        _;
    }

    function isBookBorrowed(
        uint[] memory bookIds,
        uint _bookId
    ) private pure returns (bool) {
        // TODO check whether NPE is required if bookIds is empty for Solidity
        for (uint i = 0; i < bookIds.length; i++) {
            if (bookIds[i] == _bookId) {
                return true;
            }
        }
        return false;
    }

    function returnBook(uint _bookId) external {
        require(
            isBookBorrowed(borrowerToBookIds[msg.sender], _bookId),
            "You haven't borrowed this book!"
        );
        // Add back the book to the lib
        bookIdToQuantity[_bookId]++;

        // Remove the book from the borrower
        uint[] storage borrowedBooks = borrowerToBookIds[msg.sender];

        // TODO: Check whether it's fine to create a new uint[] array and assign it and why this approach hangs the transaction ?

        // Unordered array deletion
        uint idxToDelete;
        for (uint i = 0; i < borrowedBooks.length; i++) {
            if (borrowedBooks[i] == _bookId) {
                idxToDelete = i;
                break;
            }
        }
        delete borrowedBooks[idxToDelete];
        borrowedBooks.pop();
    }
}
