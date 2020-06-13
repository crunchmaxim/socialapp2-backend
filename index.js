const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const firebase = require('firebase')

const app = express();
app.use(cors());

admin.initializeApp();
const db = admin.firestore();

const firebaseConfig = {
    apiKey: "AIzaSyAsae74LvBzykYPo7bANZ9A1z20Yepyb2I",
    authDomain: "socialapp2-f9053.firebaseapp.com",
    databaseURL: "https://socialapp2-f9053.firebaseio.com",
    projectId: "socialapp2-f9053",
    storageBucket: "socialapp2-f9053.appspot.com",
    messagingSenderId: "158140953454",
    appId: "1:158140953454:web:963054003ca699ba39477f"
};

firebase.initializeApp(firebaseConfig);

app.get('/posts', async (req, res) => {
    const posts = [];
    try {
        const snapshot = await db.collection('posts').orderBy('createdAt', 'desc').get()
        snapshot.forEach(doc => {
            let id = doc.id;
            let data = doc.data();

            posts.push({ id, ...data })
        });
        return res.json(posts);
    } catch (error) {
        return res.status(500).json(error)
    }
})

app.get('/posts/:postId', async (req, res) => {
    try {
        const snapshot = await db.doc(`/posts/${req.params.postId}`).get();
        if (!snapshot.exists) {
            return res.status(404).json({ error: 'Post not found' })
        }
        const post = {
            id: snapshot.id,
            ...snapshot.data()
        }
        return res.json(post)
    } catch (error) {
        return res.status(500).json(error)
    }
})

app.post('/posts', async (req, res) => {
    try {
        if (req.body.body.trim() === '') {
            return res.status(400).json({ body: 'Body must not be empty' })
        }
        const newPost = {
            username: req.body.username,
            body: req.body.body,
            createdAt: new Date().toISOString()
        }
        await db.collection('posts').add(newPost);
        return res.json('Post added');

    } catch (error) {
        return res.status(500).json(error)
    }
})

app.post('/signup', async (req, res) => {
    try {
        const newUser = {
            username: req.body.username,
            password: req.body.password,
            confirmPassword: req.body.password,
            email: req.body.email
        }
        const doc = await db.doc(`/users/${req.body.username}`).get();
        if (doc.exists) {
            return res.status(400).json('User with this name already exists');
        } else {
            const newUserData = await firebase.auth().createUserWithEmailAndPassword(req.body.email, req.body.username);
            const token = await newUserData.user.getIdToken();

            newUserCredentials = {
                username: req.body.username,
                email: req.body.email,
                createdAt: new Date().toISOString(),
                userId: newUserData.user.uid
            }

            await db.doc(`/users/${req.body.username}`).set(newUserCredentials)

            return res.json({ token });
        }
    } catch (error) {
        res.status(500).json(error)
    }
})

exports.api = functions.region('europe-west1').https.onRequest(app);