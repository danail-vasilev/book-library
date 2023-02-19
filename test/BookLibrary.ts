import { expect } from "chai";
import { ethers } from "hardhat";
import { BookLibrary } from "../typechain-types/index.js";

describe("BookLibrary", function () {
  const bookTitle1: string = "Mastering Ethereum";
  const bookId1: string =
    "0x4d6173746572696e6720457468657265756d0000000000000000000000000000";
  const bookCopiesInit = 3;
  const bookCopiesAdded = 8;
  const bookCopiesDecreased = 7;

  let bookLibraryFactory;
  let bookLibrary: BookLibrary;

  before(async () => {
    bookLibraryFactory = await ethers.getContractFactory("BookLibrary");
    bookLibrary = await bookLibraryFactory.deploy();
    await bookLibrary.deployed();
  });

  it("Should throw when try to add a book with no title, no copies, not an owner", async function () {
    await expect(bookLibrary.addBook("", 1)).to.be.revertedWith(
      "Book title is not valid"
    );
    await expect(bookLibrary.addBook(bookTitle1, 0)).to.be.revertedWith(
      "Invalid number of copies"
    );
    const [owner, addr1] = await ethers.getSigners();
    await expect(
      bookLibrary.connect(addr1).addBook("Rand Book Title", 10)
    ).to.be.revertedWith("Ownable: caller is not the owner");
  });

  it("Should add a book", async function () {
    const addBookTx = await bookLibrary.addBook(bookTitle1, bookCopiesInit);
    await addBookTx.wait();
    expect(await bookLibrary.bookKey(0)).to.be.equal(bookId1);
    // TODO: Can we insert type from contact ?
    const book: any = await bookLibrary.books(bookId1);
    expect(book.currentCopies).to.be.equal(bookCopiesInit);
    expect(book.allCopies).to.be.equal(bookCopiesInit);
    expect(book.title).to.be.equal(bookTitle1);
    // Test arrays via getter func
    const borrowers = await bookLibrary.listBookBorrowers(bookTitle1);
    expect(borrowers.length).to.be.equal(0);
    const addBookTx2 = await bookLibrary.addBook(bookTitle1, 5);
    await addBookTx2.wait();
    expect((await bookLibrary.books(bookId1)).currentCopies).to.be.equal(
      bookCopiesAdded
    );
    expect((await bookLibrary.books(bookId1)).allCopies).to.be.equal(
      bookCopiesInit + 5
    );
  });

  it("Should borrow a book", async function () {
    borrowBook();
  });

  it("Should throw when try to borrow an already borrowed book, book with no title, no copies", async function () {
    await expect(bookLibrary.borrowBook(bookTitle1)).to.be.revertedWith(
      "You have already borrowed this book"
    );
    await expect(bookLibrary.borrowBook("")).to.be.revertedWith(
      "Book title is not valid"
    );
    await expect(bookLibrary.borrowBook("Some book title")).to.be.revertedWith(
      "There are no available books at the moment"
    );
  });

  it("Should return a book", async function () {
    const returnBookTx = await bookLibrary.returnBook(bookTitle1);
    await returnBookTx.wait();
    const book: any = await bookLibrary.books(bookId1);
    expect(book.currentCopies).to.be.equal(bookCopiesAdded);
    // Assert all copies to not be changed
    expect(book.title).to.be.equal(bookTitle1);
    const borrowers = await bookLibrary.listBookBorrowers(bookTitle1);
    const [owner, addr1] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    expect(borrowers[0]).to.be.equal(ownerAddress);
    expect(borrowers.length).to.be.equal(1);
    // TODO: Should me test Events ?
  });

  it("Should throw when try to return a non-borrowed book, book with no title", async function () {
    await expect(bookLibrary.returnBook("")).to.be.revertedWith(
      "Book title is not valid"
    );
    await expect(bookLibrary.returnBook("Some book title")).to.be.revertedWith(
      "You haven't borrowed this book"
    );
  });

  it("Should borrow an older book", async function () {
    // Reborrow a book; Borrowers must not be changed.
    borrowBook();
  });
  async function borrowBook() {
    const borrowBookTx = await bookLibrary.borrowBook(bookTitle1);
    await borrowBookTx.wait();
    const book: any = await bookLibrary.books(bookId1);
    expect(book.currentCopies).to.be.equal(bookCopiesDecreased);
    // Assert all copies as well to not be changed;
    expect(book.title).to.be.equal(bookTitle1);
    const borrowers = await bookLibrary.listBookBorrowers(bookTitle1);
    const [owner, addr1] = await ethers.getSigners();
    const ownerAddress = await owner.getAddress();
    expect(borrowers[0]).to.be.equal(ownerAddress);
    expect(borrowers.length).to.be.equal(1);
  }
  it("Should check available books", async function () {
    const availableBookTitles = await bookLibrary.getAvailableBooks();
    expect(availableBookTitles.length).to.be.equal(1);
    expect(availableBookTitles[0]).to.be.equal(bookTitle1 + " is available");
  });
});
