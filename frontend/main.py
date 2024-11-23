import requests
import pdfplumber
import xmltodict
import json
import os

# List of topics
topics = [
    "Product education",
]

# Function to fetch papers from arXiv
def fetch_arxiv_papers(query, max_results=5):
    api_url = "http://export.arxiv.org/api/query"
    params = {
        "search_query": f"all:{query}",
        "start": 0,
        "max_results": max_results,
    }

    try:
        response = requests.get(api_url, params=params)
        response.raise_for_status()
        data = xmltodict.parse(response.text)
        return data
    except requests.exceptions.RequestException as e:
        print(f"Error fetching data for query '{query}': {e}")
        return None

# Function to download and parse PDF
def download_and_parse_pdf(pdf_url):
    try:
        response = requests.get(pdf_url, stream=True)
        response.raise_for_status()
        with open("temp.pdf", "wb") as f:
            f.write(response.content)
        
        # Extract content from PDF
        with pdfplumber.open("temp.pdf") as pdf:
            text = ""
            for page in pdf.pages:
                text += page.extract_text()
        os.remove("temp.pdf")  # Clean up temporary file
        return text
    except Exception as e:
        print(f"Error downloading or parsing PDF: {e}")
        return ""

# Main process
results = []
for topic in topics:
    print(f"Fetching papers for topic: {topic}")
    data = fetch_arxiv_papers(topic)
    if data and "feed" in data:
        entries = data["feed"].get("entry", [])
        entries = entries if isinstance(entries, list) else [entries]
        
        for entry in entries:
            paper = {
                "title": entry["title"],
                "authors": [author["name"] for author in (entry["author"] if isinstance(entry["author"], list) else [entry["author"]])],
                "link": entry["id"],
                "date": entry["published"],
                "content": None,
            }
            pdf_url = entry["id"].replace("abs", "pdf")  # Get the PDF URL
            print(f"Parsing PDF for paper: {paper['title']}")
            paper["content"] = download_and_parse_pdf(pdf_url)
            results.append(paper)

# Save results to a JSON file
with open("arxiv_results.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=4)

print("Results saved to arxiv_results.json")
