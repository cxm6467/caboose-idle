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

func securityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("Content-Security-Policy", "default-src 'self'")
}

func handler(w http.ResponseWriter, r *http.Request) {
	securityHeaders(w)

	webRoot, err := os.Getwd()
	if err != nil {
		http.NotFound(w, r)
		return
	}

	path := filepath.Clean(filepath.Join(webRoot, r.URL.Path))
	if path == webRoot {
		path = filepath.Join(webRoot, "index.html")
	}

	if !strings.HasPrefix(path, webRoot+string(filepath.Separator)) {
		http.NotFound(w, r)
		return
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
