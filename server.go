package main

import (
	"fmt"
	"net/http"
	"os"
	"path/filepath"
	"strings"
)

func mimeType(path string) string {
	switch strings.ToLower(filepath.Ext(path)) {
	case ".html":
		return "text/html"
	case ".css":
		return "text/css"
	case ".js":
		return "application/javascript"
	default:
		return "text/plain"
	}
}

func handler(w http.ResponseWriter, r *http.Request) {
	path := "." + r.URL.Path
	if path == "./" {
		path = "./index.html"
	}
	data, err := os.ReadFile(path)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", mimeType(path))
	w.Write(data)
}

func main() {
	http.HandleFunc("/", handler)
	fmt.Println("Serving at http://localhost:8000")
	http.ListenAndServe(":8000", nil)
}
