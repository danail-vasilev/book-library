// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookLibrary is Ownable {
    using StringUtil for string;
    struct Book {
        string title;
        uint copies;
        address[] bookBorrowedAddresses; // TODO: Change to addresses that have ever borrowed a book
    }

    // It's more cheaper to make a state variable public rather than creating a getter function
    // Solidity already creates a getter for public vars
    // OpenZeppelin, however, creates such public getters in order to avoid state variables override in inheritance
    bytes32[] public bookKey;

    mapping(bytes32 => Book) public books;

    // Use nested mapping to avoid loops.
    // bytes32 is more gas efficient than uint256 for storing book ids
    mapping(address => mapping(bytes32 => bool)) private userToBorrowedBooks;

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
        book.copies += _copies;
        emit BookAdded(_title, msg.sender, _copies, book.copies);
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
        require(!borrowedBooks[bookId], "You have already borrowed this book!");

        books[bookId].copies -= 1;
        books[bookId].bookBorrowedAddresses.push(msg.sender);

        borrowedBooks[bookId] = true;
        emit BookBorrowed(_title, msg.sender, books[bookId].copies);
    }

    modifier availableBook(string memory _title) {
        bytes32 id = _title.toBytes32();
        require(
            books[id].copies > 0,
            "There are no available books at the moment"
        );
        _;
    }

    function returnBook(
        string calldata _title
    ) external validTitle(_title) borrowedBook(_title) {
        bytes32 bookId = _title.toBytes32();

        // Add back the book to the lib
        books[bookId].copies += 1;

        // Remove the book from the borrower
        userToBorrowedBooks[msg.sender][bookId] = false;

        address[] storage bookBorrowedAddresses = books[bookId]
            .bookBorrowedAddresses;

        // Unordered array deletion
        // TODO: Make bookBorrowedAddresses historical and remove that
        uint idxToDelete;
        for (uint i = 0; i < bookBorrowedAddresses.length; i++) {
            if (bookBorrowedAddresses[i] == msg.sender) {
                idxToDelete = i;
                break;
            }
        }
        delete bookBorrowedAddresses[idxToDelete];
        bookBorrowedAddresses.pop();
        emit BookReturned(_title, msg.sender, books[bookId].copies);
    }

    // TODO: Best practice for params data location in modifiers ?
    //  * both calldata and memory compiles, no gas change
    //  * Probably memory because modifiers are internal
    modifier validTitle(string memory _title) {
        require(!_title.isEmpty(), "Book title is not valid");
        _;
    }

    modifier borrowedBook(string memory _title) {
        require(
            userToBorrowedBooks[msg.sender][_title.toBytes32()],
            "You haven't borrowed this book"
        );
        _;
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
