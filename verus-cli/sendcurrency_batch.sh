#!/bin/bash

# Enhanced VLotto Batch sendcurrency Script
# Sends multiple identical amounts from one address to another (with currency selection)

echo "=========================================================="
echo "🚀 Enhanced VLotto Batch sendcurrency Generator"
echo "=========================================================="
echo ""
echo "💡 This script supports flexible currency transfers with:"
echo "   • Multiple currency types (VRSCTEST, VRSC, custom currencies)"
echo "   • Separate from/to addresses"
echo "   • Multiple iterations for UTXO management"
echo "   • All Verus address types (R, i, ID)"
echo ""

# Function to validate address format
validate_address() {
    local addr="$1"
    local label="$2"
    
    # Check if it's an R-address (starts with R, typically 34 characters)
    if [[ $addr =~ ^R[A-Za-z0-9]{33,34}$ ]]; then
        echo "✅ Valid R-address detected for $label: $addr"
        return 0
    # Check if it's a VerusID (ends with @)
    elif [[ $addr =~ @$ ]]; then
        echo "✅ Valid VerusID detected for $label: $addr"
        return 0
    # Check if it's an i-address (starts with i, typically 34 characters)
    elif [[ $addr =~ ^i[A-Za-z0-9]{33,34}$ ]]; then
        echo "✅ Valid i-address detected for $label: $addr"
        return 0
    # Check if it's a simple ID without @ (allow flexibility for IDs)
    elif [[ $addr =~ ^[a-zA-Z0-9][a-zA-Z0-9\.\_\-]*$ ]] && [[ ${#addr} -ge 3 ]] && [[ ${#addr} -le 64 ]]; then
        echo "✅ Valid Identity/Currency name detected for $label: $addr"
        return 0
    else
        echo "❌ Invalid address format for $label: $addr"
        echo "   Supported formats:"
        echo "   • R-address: R9bzdvKcBFPr3NSYQWb1nU5tMCezNXTbD1"
        echo "   • VerusID: alice@ or myidentity.shylock@"
        echo "   • i-address: ixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
        echo "   • Identity: myidentity.shylock"
        return 1
    fi
}

# Get FROM address
echo "📤 FROM ADDRESS (Source of funds):"
echo "   • R-address: R9bzdvKcBFPr3NSYQWb1nU5tMCezNXTbD1"
echo "   • VerusID: alice@ or jackpot.shylock@"
echo "   • i-address: ixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
echo "   • Identity: myidentity.shylock"
echo ""
read -p "📤 Enter the FROM address: " from_address

# Validate FROM address
if ! validate_address "$from_address" "FROM address"; then
    exit 1
fi
echo ""

# Get currency type
echo "💰 CURRENCY TYPE:"
echo "   • VRSCTEST (testnet currency)"
echo "   • VRSC (mainnet currency)"
echo "   • Custom currency name (e.g., shylock, mycoin)"
echo ""
read -p "💰 Enter currency type: " currency

# Validate currency (basic validation - allow alphanumeric and dots)
if [[ ! $currency =~ ^[a-zA-Z0-9][a-zA-Z0-9\.\_\-]*$ ]] || [[ ${#currency} -lt 1 ]] || [[ ${#currency} -gt 64 ]]; then
    echo "❌ Invalid currency format. Must be alphanumeric (can contain dots, underscores, dashes)."
    exit 1
fi

echo "✅ Currency selected: $currency"
echo ""

# Get amount per transaction
read -p "💵 Enter amount per transaction: " amount

# Validate amount is a positive number
if ! [[ "$amount" =~ ^[0-9]+\.?[0-9]*$ ]] || (( $(echo "$amount <= 0" | bc -l) )); then
    echo "❌ Invalid amount. Must be a positive number."
    exit 1
fi
echo ""

# Get TO address (destination)
echo "📥 TO ADDRESS (Destination for funds):"
echo "   • Can be same as FROM address (for UTXO splitting)"
echo "   • Can be different address (for transfers)"
echo "   • Same format rules as FROM address"
echo ""
read -p "📥 Enter the TO address: " to_address

# Validate TO address
if ! validate_address "$to_address" "TO address"; then
    exit 1
fi
echo ""

# Get number of iterations
read -p "🔢 Enter number of iterations (transactions): " iterations

# Validate iterations is a positive number
if ! [[ "$iterations" =~ ^[0-9]+$ ]] || [ "$iterations" -lt 1 ]; then
    echo "❌ Invalid number of iterations. Must be a positive integer."
    exit 1
fi

# Calculate total amount
total_amount=$(echo "$amount * $iterations" | bc -l)

echo ""
echo "📋 TRANSACTION SUMMARY:"
echo "   Currency: $currency"
echo "   FROM Address: $from_address"
echo "   TO Address: $to_address"
echo "   Amount per transaction: $amount $currency"
echo "   Number of transactions: $iterations"
echo "   Total amount: $total_amount $currency"
echo ""

# Determine operation type
if [ "$from_address" = "$to_address" ]; then
    echo "🔄 Operation Type: UTXO SPLITTING (sending to same address)"
    echo "   This will create $iterations separate UTXOs of $amount $currency each"
else
    echo "📤 Operation Type: TRANSFER (sending to different address)"
    echo "   This will send $amount $currency to $to_address $iterations times"
fi
echo ""

# Show Verus command that will be executed
echo "🔧 VERUS COMMAND TO BE EXECUTED:"
echo "   ./verus -chain=vrsctest sendcurrency \"$from_address\" JSON_ARRAY"
echo ""

# Warning for large operations
if [ "$iterations" -gt 100 ]; then
    echo "⚠️  WARNING: Large number of iterations ($iterations)"
    echo "   This will create many blockchain transactions"
    echo "   Consider splitting into smaller batches"
    echo ""
fi

# Confirm execution
read -p "❓ Do you want to execute this sendcurrency command? (y/N): " confirm

if [[ ! $confirm =~ ^[Yy]$ ]]; then
    echo "❌ Operation cancelled by user."
    exit 0
fi

echo ""
echo "🔧 Building sendcurrency command..."

# Build JSON array with currency specification
json_array="["
for ((i=1; i<=iterations; i++)); do
    if [ $i -eq 1 ]; then
        json_array+="{\"currency\":\"$currency\",\"amount\":$amount,\"address\":\"$to_address\"}"
    else
        json_array+=",{\"currency\":\"$currency\",\"amount\":$amount,\"address\":\"$to_address\"}"
    fi
done
json_array+="]"

# Build the final command
command="./verus -chain=vrsctest sendcurrency \"$from_address\" '$json_array'"

echo "🚀 Executing sendcurrency command..."
echo "💻 Full Command:"
echo "   $command"
echo ""
echo "📡 Sending to blockchain..."

# Execute the command
eval $command

# Check exit status and provide detailed feedback
if [ $? -eq 0 ]; then
    echo ""
    echo "✅ SENDCURRENCY COMMAND EXECUTED SUCCESSFULLY!"
    echo ""
    echo "📊 Transaction Summary:"
    echo "   ✓ Sent: $total_amount $currency total"
    echo "   ✓ From: $from_address"
    echo "   ✓ To: $to_address"
    echo "   ✓ Transactions: $iterations × $amount $currency"
    echo ""
    if [ "$from_address" = "$to_address" ]; then
        echo "🔄 UTXO Splitting Complete:"
        echo "   Created $iterations separate UTXOs for parallel operations"
    else
        echo "📤 Transfer Complete:"
        echo "   Funds sent to destination address"
    fi
    echo ""
    echo "⏱️  Note: Transactions may take time to confirm on the blockchain"
    echo "   Use 'listunspent' to verify UTXOs after confirmation"
else
    echo ""
    echo "❌ SENDCURRENCY COMMAND FAILED!"
    echo ""
    echo "🔍 Possible Issues:"
    echo "   • Insufficient balance in source address"
    echo "   • Invalid address format"
    echo "   • Network connectivity issues"
    echo "   • Verus daemon not running or not synced"
    echo ""
    echo "💡 Troubleshooting:"
    echo "   1. Check balance: ./verus -chain=vrsctest getcurrencybalance \"$from_address\""
    echo "   2. Verify addresses are valid on the network"
    echo "   3. Ensure Verus daemon is running and synced"
    echo ""
    exit 1
fi 