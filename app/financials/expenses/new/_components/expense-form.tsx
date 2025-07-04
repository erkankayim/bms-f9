// Define a functional component named ExpenseForm
function ExpenseForm() {
  // The component returns a simple form
  return (
    <form>
      {/* Input field for expense description */}
      <div>
        <label htmlFor="description">Description:</label>
        <input type="text" id="description" name="description" />
      </div>

      {/* Input field for expense amount */}
      <div>
        <label htmlFor="amount">Amount:</label>
        <input type="number" id="amount" name="amount" />
      </div>

      {/* Select field for expense category */}
      <div>
        <label htmlFor="category">Category:</label>
        <select id="category" name="category">
          <option value="food">Food</option>
          <option value="transport">Transport</option>
          <option value="entertainment">Entertainment</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Button to submit the form */}
      <button type="submit">Add Expense</button>
    </form>
  )
}

// ADD the default export so both named and default variants exist.
export default ExpenseForm
