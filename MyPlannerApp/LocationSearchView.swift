import SwiftUI
import MapKit

// MARK: - Location Search Result
struct LocationSearchResult: Identifiable {
    let id = UUID()
    let title: String
    let subtitle: String
    let placemark: MKPlacemark
    
    var fullAddress: String {
        var components: [String] = []
        if let name = placemark.name { components.append(name) }
        if let thoroughfare = placemark.thoroughfare { components.append(thoroughfare) }
        if let locality = placemark.locality { components.append(locality) }
        if let administrativeArea = placemark.administrativeArea { components.append(administrativeArea) }
        return components.joined(separator: ", ")
    }
}

// MARK: - Location Search View
struct LocationSearchView: View {
    @Binding var selectedLocation: String
    @Environment(\.dismiss) var dismiss
    
    @StateObject private var searchCompleter = LocationSearchCompleter()
    @State private var searchText = ""
    
    var body: some View {
        NavigationView {
            VStack(spacing: 0) {
                // Search Bar
                HStack {
                    Image(systemName: "magnifyingglass")
                        .foregroundColor(.gray)
                    
                    TextField("Search for a location", text: $searchText)
                        .textFieldStyle(PlainTextFieldStyle())
                        .onChange(of: searchText) { newValue in
                            searchCompleter.searchQuery = newValue
                        }
                    
                    if !searchText.isEmpty {
                        Button(action: { searchText = "" }) {
                            Image(systemName: "xmark.circle.fill")
                                .foregroundColor(.gray)
                        }
                    }
                }
                .padding()
                .background(Color(.systemGray6))
                
                Divider()
                
                // Results List
                if searchCompleter.results.isEmpty && !searchText.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "magnifyingglass")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        
                        Text("No locations found")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if searchText.isEmpty {
                    VStack(spacing: 16) {
                        Image(systemName: "mappin.and.ellipse")
                            .font(.system(size: 48))
                            .foregroundColor(.gray)
                        
                        Text("Start typing to search")
                            .foregroundColor(.secondary)
                    }
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else {
                    List {
                        ForEach(searchCompleter.results) { result in
                            Button(action: {
                                selectedLocation = result.fullAddress
                                dismiss()
                            }) {
                                VStack(alignment: .leading, spacing: 4) {
                                    Text(result.title)
                                        .font(.headline)
                                        .foregroundColor(.primary)
                                    
                                    Text(result.subtitle)
                                        .font(.subheadline)
                                        .foregroundColor(.secondary)
                                }
                                .padding(.vertical, 4)
                            }
                        }
                    }
                    .listStyle(PlainListStyle())
                }
            }
            .navigationTitle("Add Location")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") { dismiss() }
                }
            }
        }
    }
}

// MARK: - Location Search Completer
class LocationSearchCompleter: NSObject, ObservableObject, MKLocalSearchCompleterDelegate {
    @Published var results: [LocationSearchResult] = []
    
    private let completer: MKLocalSearchCompleter
    
    var searchQuery: String = "" {
        didSet {
            if searchQuery.isEmpty {
                results = []
                completer.cancel()
            } else {
                completer.queryFragment = searchQuery
            }
        }
    }
    
    override init() {
        completer = MKLocalSearchCompleter()
        super.init()
        completer.delegate = self
        completer.resultTypes = [.address, .pointOfInterest]
    }
    
    func completerDidUpdateResults(_ completer: MKLocalSearchCompleter) {
        Task { @MainActor in
            var locationResults: [LocationSearchResult] = []
            
            for completion in completer.results {
                // Create search request manually for iOS 16 compatibility
                let searchRequest = MKLocalSearch.Request()
                searchRequest.naturalLanguageQuery = completion.title + " " + completion.subtitle
                let search = MKLocalSearch(request: searchRequest)
                
                do {
                    let response = try await search.start()
                    if let item = response.mapItems.first {
                        let result = LocationSearchResult(
                            title: completion.title,
                            subtitle: completion.subtitle,
                            placemark: item.placemark
                        )
                        locationResults.append(result)
                    }
                } catch {
                    // Continue to next result if this one fails
                    continue
                }
            }
            
            self.results = locationResults
        }
    }
    
    func completer(_ completer: MKLocalSearchCompleter, didFailWithError error: Error) {
        print("Location search error: \(error.localizedDescription)")
        results = []
    }
}

// MARK: - Location Field with Search Button
struct LocationFieldView: View {
    @Binding var location: String
    @State private var showingLocationSearch = false
    
    var body: some View {
        HStack {
            TextField("Add location (optional)", text: $location)
            
            Button(action: { showingLocationSearch = true }) {
                Image(systemName: "mappin.circle.fill")
                    .foregroundColor(.accentColor)
                    .font(.title3)
            }
        }
        .sheet(isPresented: $showingLocationSearch) {
            LocationSearchView(selectedLocation: $location)
        }
    }
}
