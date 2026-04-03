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
		return ""
	}
}

func securityHeaders(w http.ResponseWriter) {
	w.Header().Set("X-Content-Type-Options", "nosniff")
	w.Header().Set("X-Frame-Options", "DENY")
	w.Header().Set("Content-Security-Policy", "default-src 'self'")
}

func makeHandler(webRoot string) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		securityHeaders(w)

		relPath := strings.TrimPrefix(r.URL.Path, "/")
		path := filepath.Clean(filepath.Join(webRoot, relPath))
		if path == webRoot {
			path = filepath.Join(webRoot, "index.html")
		}

		if !strings.HasPrefix(path, webRoot+string(filepath.Separator)) {
			http.NotFound(w, r)
			return
		}

		// Block dotfiles and disallow unlisted extensions
		rel := strings.TrimPrefix(path, webRoot+string(filepath.Separator))
		for _, segment := range strings.Split(rel, string(filepath.Separator)) {
			if strings.HasPrefix(segment, ".") {
				http.NotFound(w, r)
				return
			}
		}
		if mimeType(path) == "" {
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
}

func main() {
	webRoot, err := os.Getwd()
	if err != nil {
		fmt.Fprintf(os.Stderr, "failed to get working directory: %v\n", err)
		os.Exit(1)
	}
	http.HandleFunc("/", makeHandler(webRoot))
	fmt.Println("Serving at http://localhost:8000")
	http.ListenAndServe(":8000", nil)
}
