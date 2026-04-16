package proxy

import (
	"net/http"
	"net/http/httputil"
	"net/url"
)

func NewBackendProxy(target string) (*httputil.ReverseProxy, error) {
	backendURL, err := url.Parse(target)
	if err != nil {
		return nil, err
	}

	proxy := httputil.NewSingleHostReverseProxy(backendURL)

	originalDirector := proxy.Director
	proxy.Director = func(req *http.Request) {
		originalDirector(req)
		req.Host = backendURL.Host
	}

	proxy.ErrorHandler = func(rw http.ResponseWriter, req *http.Request, e error) {
		rw.WriteHeader(http.StatusBadGateway)
	}

	return proxy, nil
}
