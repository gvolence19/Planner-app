import SwiftUI

struct GroceryListView: View {
    @EnvironmentObject var themeManager: ThemeManager
    @StateObject private var dataManager = DataManager.shared
    
    private var theme: AppTheme {
        themeManager.currentTheme
    }
    @State private var showingAddItem = false
    @State private var newItemName = ""
    @State private var newItemQuantity = ""
    @State private var selectedCategory = ""
    
    private let categories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Other"]
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            header
            
            // Grocery List
            if dataManager.groceryItems.isEmpty {
                emptyStateView
            } else {
                ScrollView {
                    VStack(spacing: 0) {
                        // Unchecked Items
                        if !uncheckedItems.isEmpty {
                            Section {
                                ForEach(uncheckedItems) { item in
                                    GroceryItemRow(item: item)
                                    Divider()
                                }
                            }
                        }
                        
                        // Checked Items
                        if !checkedItems.isEmpty {
                            VStack(spacing: 0) {
                                HStack {
                                    Text("Completed")
                                        .font(.headline)
                                        .foregroundColor(.secondary)
                                    Spacer()
                                    Button("Clear All") {
                                        clearCheckedItems()
                                    }
                                    .font(.subheadline)
                                    .foregroundColor(.accentColor)
                                }
                                .padding()
                                .background(Color(.systemGroupedBackground))
                                
                                ForEach(checkedItems) { item in
                                    GroceryItemRow(item: item)
                                    Divider()
                                }
                            }
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddItem) {
            AddGroceryItemSheet(isPresented: $showingAddItem)
        }
    }
    
    // MARK: - Header
    private var header: some View {
        HStack {
            Text("Grocery List")
                .font(.title2)
                .fontWeight(.bold)
            
            Spacer()
            
            Button(action: { showingAddItem = true }) {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(theme.primaryColor.color)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .shadow(color: Color.black.opacity(0.05), radius: 2, y: 2)
    }
    
    // MARK: - Empty State
    private var emptyStateView: some View {
        VStack(spacing: 16) {
            Image(systemName: "cart")
                .font(.system(size: 60))
                .foregroundColor(.gray)
            
            Text("No Items")
                .font(.title2)
                .fontWeight(.semibold)
            
            Text("Tap the + button to add items to your grocery list")
                .font(.body)
                .foregroundColor(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal, 40)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
    }
    
    // MARK: - Filtered Items
    private var uncheckedItems: [GroceryItem] {
        dataManager.groceryItems.filter { !$0.checked }
    }
    
    private var checkedItems: [GroceryItem] {
        dataManager.groceryItems.filter { $0.checked }
    }
    
    private func clearCheckedItems() {
        dataManager.groceryItems.removeAll { $0.checked }
        dataManager.saveGroceryItems()
    }
}

// MARK: - Grocery Item Row
struct GroceryItemRow: View {
    let item: GroceryItem
    @StateObject private var dataManager = DataManager.shared
    @State private var showingEdit = false
    
    var body: some View {
        HStack(spacing: 12) {
            // Checkbox
            Button(action: { dataManager.toggleGroceryItem(item) }) {
                Image(systemName: item.checked ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 24))
                    .foregroundColor(item.checked ? .green : .gray)
            }
            .buttonStyle(PlainButtonStyle())
            
            // Item Details
            VStack(alignment: .leading, spacing: 4) {
                Text(item.name)
                    .font(.system(size: 16))
                    .foregroundColor(item.checked ? .secondary : .primary)
                    .strikethrough(item.checked)
                
                HStack(spacing: 8) {
                    if let quantity = item.quantity, !quantity.isEmpty {
                        Text(quantity)
                            .font(.system(size: 13))
                            .foregroundColor(.secondary)
                    }
                    
                    if let category = item.category, !category.isEmpty {
                        Text(category)
                            .font(.system(size: 12))
                            .foregroundColor(.secondary)
                            .padding(.horizontal, 8)
                            .padding(.vertical, 2)
                            .background(Color(.systemGray6))
                            .cornerRadius(4)
                    }
                }
            }
            
            Spacer()
            
            // Edit/Delete Menu
            Menu {
                Button(action: { showingEdit = true }) {
                    Label("Edit", systemImage: "pencil")
                }
                
                Button(role: .destructive, action: { dataManager.deleteGroceryItem(item) }) {
                    Label("Delete", systemImage: "trash")
                }
            } label: {
                Image(systemName: "ellipsis.circle")
                    .font(.system(size: 20))
                    .foregroundColor(.gray)
            }
        }
        .padding()
        .background(Color(.systemBackground))
        .sheet(isPresented: $showingEdit) {
            EditGroceryItemSheet(item: item, isPresented: $showingEdit)
        }
    }
}

// MARK: - Add Grocery Item Sheet
struct AddGroceryItemSheet: View {
    @Binding var isPresented: Bool
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name = ""
    @State private var quantity = ""
    @State private var category = ""
    @State private var notes = ""
    
    private let categories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Other"]
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Item Details")) {
                    TextField("Item name", text: $name)
                    TextField("Quantity (optional)", text: $quantity)
                }
                
                Section(header: Text("Category")) {
                    Picker("Category", selection: $category) {
                        Text("None").tag("")
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section(header: Text("Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 60)
                }
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        addItem()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func addItem() {
        let item = GroceryItem(
            name: name,
            quantity: quantity.isEmpty ? nil : quantity,
            category: category.isEmpty ? nil : category,
            notes: notes.isEmpty ? nil : notes
        )
        
        dataManager.addGroceryItem(item)
        isPresented = false
    }
}

// MARK: - Edit Grocery Item Sheet
struct EditGroceryItemSheet: View {
    let item: GroceryItem
    @Binding var isPresented: Bool
    @StateObject private var dataManager = DataManager.shared
    
    @State private var name: String
    @State private var quantity: String
    @State private var category: String
    @State private var notes: String
    
    private let categories = ["Produce", "Dairy", "Meat", "Bakery", "Pantry", "Frozen", "Other"]
    
    init(item: GroceryItem, isPresented: Binding<Bool>) {
        self.item = item
        self._isPresented = isPresented
        _name = State(initialValue: item.name)
        _quantity = State(initialValue: item.quantity ?? "")
        _category = State(initialValue: item.category ?? "")
        _notes = State(initialValue: item.notes ?? "")
    }
    
    var body: some View {
        NavigationView {
            Form {
                Section(header: Text("Item Details")) {
                    TextField("Item name", text: $name)
                    TextField("Quantity (optional)", text: $quantity)
                }
                
                Section(header: Text("Category")) {
                    Picker("Category", selection: $category) {
                        Text("None").tag("")
                        ForEach(categories, id: \.self) { cat in
                            Text(cat).tag(cat)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                }
                
                Section(header: Text("Notes")) {
                    TextEditor(text: $notes)
                        .frame(minHeight: 60)
                }
            }
            .navigationTitle("Edit Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        isPresented = false
                    }
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Save") {
                        saveChanges()
                    }
                    .disabled(name.isEmpty)
                }
            }
        }
    }
    
    private func saveChanges() {
        let updatedItem = GroceryItem(
            id: item.id,
            name: name,
            quantity: quantity.isEmpty ? nil : quantity,
            category: category.isEmpty ? nil : category,
            checked: item.checked,
            notes: notes.isEmpty ? nil : notes
        )
        
        dataManager.updateGroceryItem(updatedItem)
        isPresented = false
    }
}

// MARK: - Preview
struct GroceryListView_Previews: PreviewProvider {
    static var previews: some View {
        GroceryListView()
    }
}
