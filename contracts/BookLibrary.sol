// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookLibrary is Ownable {
    using StringUtil for string;
    struct Book {
        string title;
        uint allCopies;
        uint currentCopies;
        address[] bookBorrowedAddresses;
    }

    // It's more cheaper to make a state variable public rather than creating a getter function
    // Solidity already creates a getter for public vars
    // OpenZeppelin, however, creates such public getters in order to avoid state variables override in inheritance
    bytes32[] public bookKey;

    mapping(bytes32 => Book) public books;

    // Use nested mapping to avoid loops.
    // bytes32 is more gas efficient than uint256 for storing book ids
    mapping(address => mapping(bytes32 => bool)) private userToBorrowedBooks;

    // TODO: Should we keep it here or inside Book struct
    // A helper mapping used to keep Book.bookBorrowedAddresses unique
    mapping(address => mapping(bytes32 => bool))
        private userToBorrowedBooksHistory;

    event BookAdded(
        string title,
        address owner,
        uint256 addedCopies,
        uint256 allCopies
    );
    event BookBorrowed(string title, address borrower, uint256 leftCopies);
    event BookReturned(string title, address borrower, uint256 leftCopies);

    function addBook(
        string calldata _title,
        uint256 _copies
    ) external onlyOwner validTitle(_title) {
        require(_copies > 0, "Invalid number of copies");
        bytes32 bookId = _title.toBytes32();

        Book storage book = books[bookId];
        // Initial book adding:
        //  * update title of the struct and push book id.
        //  * struct's default values: copies = 0, bookBorrowedAddresses = [];
        if (book.title.isEmpty()) {
            book.title = _title;
            bookKey.push(bookId);
        }
        // Update copies of the book. If book is initially added copies defaults to 0.
        book.allCopies += _copies;
        book.currentCopies += _copies;
        emit BookAdded(_title, msg.sender, _copies, book.allCopies);
    }

    // Modifiers for valid title and book existence can be added
    function listBookBorrowers(
        string calldata _title
    ) external view returns (address[] memory) {
        bytes32 bookId = _title.toBytes32();
        return books[bookId].bookBorrowedAddresses;
    }

    function borrowBook(
        string calldata _title
    ) external validTitle(_title) availableBook(_title) {
        bytes32 bookId = _title.toBytes32();

        mapping(bytes32 => bool) storage borrowedBooks = userToBorrowedBooks[
            msg.sender
        ];
        require(!borrowedBooks[bookId], "You have already borrowed this book");

        // Decrease copies of the book
        books[bookId].currentCopies -= 1;
        // Mark book as borrowed in the user's data entry
        borrowedBooks[bookId] = true;

        // User borrows book for the first time - include borrower to the book history list
        if (!userToBorrowedBooksHistory[msg.sender][bookId]) {
            userToBorrowedBooksHistory[msg.sender][bookId] = true;
            books[bookId].bookBorrowedAddresses.push(msg.sender);
        }
        emit BookBorrowed(_title, msg.sender, books[bookId].currentCopies);
    }

    modifier availableBook(string calldata _title) {
        require(
            isAvailable(_title),
            "There are no available books at the moment"
        );
        _;
    }

    function isAvailable(string calldata _title) public view returns (bool) {
        return books[_title.toBytes32()].currentCopies > 0;
    }

    function returnBook(
        string calldata _title
    ) external validTitle(_title) borrowedBook(_title) {
        bytes32 bookId = _title.toBytes32();

        // Add back the book to the lib
        books[bookId].currentCopies += 1;

        // Remove the book from the borrower
        userToBorrowedBooks[msg.sender][bookId] = false;
        emit BookReturned(_title, msg.sender, books[bookId].currentCopies);
    }

    // TODO: Best practice for params data location in modifiers ?
    //  * both calldata and memory compiles, no gas change
    //  * Probably memory because modifiers are internal
    modifier validTitle(string memory _title) {
        require(!_title.isEmpty(), "Book title is not valid");
        _;
    }

    modifier borrowedBook(string calldata _title) {
        require(isBorrowed(_title), "You haven't borrowed this book");
        _;
    }

    function isBorrowed(string calldata _title) public view returns (bool) {
        return userToBorrowedBooks[msg.sender][_title.toBytes32()];
    }

    function getAvailableBooks() external view returns (string[] memory) {
        string[] memory availableBooks = new string[](bookKey.length);
        for (uint256 i = 0; i < bookKey.length; i++) {
            Book memory currBook = books[bookKey[i]];
            availableBooks[i] = string(
                abi.encodePacked(
                    currBook.title,
                    currBook.currentCopies > 0
                        ? " is available"
                        : " is not available"
                )
            );
        }
        return availableBooks;
    }

    function getBookInfo(
        string calldata _title
    ) external view returns (Book memory) {
        return books[_title.toBytes32()];
    }
}

library StringUtil {
    // Compiles also with calldata + public/external; No change is gas
    function toBytes32(string memory _str) internal pure returns (bytes32) {
        return bytes32(bytes(_str));
    }

    function isEmpty(string memory _str) internal pure returns (bool) {
        return bytes(_str).length == 0;
    }
}
