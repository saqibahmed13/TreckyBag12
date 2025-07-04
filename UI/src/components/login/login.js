import React from 'react';
import ReactDOM from 'react-dom/client';
// import { AxiosProvider, Request, Get, Delete, Head, Post, Put, Patch, withAxios } from 'react-axios';
import './login.css';

export default function Login() {
    // ...
    return (
        <div className="Login">
            <h2>Welcome to Login Page</h2>
            <div className="content">
                <form action="#">
                    <div className="field">
                        <input id="email" type="text" placeholder="Enter Email Address" />
                        <div className="icons">
                            <span className="icon1 fas fa-exclamation"></span>
                            <span className="icon2 fas fa-check"></span>
                        </div>
                    </div>
                    <div className="error-text">
                        Please Enter Valid Email Address
                    </div>
                    <button>Submit</button>
                </form>
            </div>
        </div>
    );
}