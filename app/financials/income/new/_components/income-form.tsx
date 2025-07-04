// Define a functional component named IncomeForm
function IncomeForm() {
  // Return JSX that represents the form
  return (
    <form>
      {/* Form content goes here */}
      <div>
        <label htmlFor="incomeSource">Income Source:</label>
        <input type="text" id="incomeSource" name="incomeSource" />
      </div>
      <div>
        <label htmlFor="amount">Amount:</label>
        <input type="number" id="amount" name="amount" />
      </div>
      <div>
        <label htmlFor="date">Date:</label>
        <input type="date" id="date" name="date" />
      </div>
      <button type="submit">Submit</button>
    </form>
  )
}

// ADD the default export so both named and default variants exist.
export default IncomeForm
