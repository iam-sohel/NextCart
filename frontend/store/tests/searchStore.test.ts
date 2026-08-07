import useSearchStore from "../searchStore";

// Test 1: Search for "iphone"
const store = useSearchStore.getState();
store.search("iphone");
console.log("Search results:", store.results.length); // Should show iphone products

// Test 2: Add category filter
store.setCategory("mobiles");
console.log("After category filter:", store.results.length); // Fewer results

// Test 3: Page should reset
console.log("Current page:", store.currentPage); // Should be 1