const express = require('express');
const app = express();

app.use(express.json());

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://bltnpoukibscmpjgvdtc.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJsdG5wb3VraWJzY21wamd2ZHRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODI5NjU4NDEsImV4cCI6MTk5ODU0MTg0MX0.LjLMP0JW5Cj83eB-1rX2QLcUCkk_9T6y8oVUS1MBNHw";

const supabase = createClient(supabaseUrl, supabaseKey);


