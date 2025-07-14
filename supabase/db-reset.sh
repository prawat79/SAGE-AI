#!/bin/bash
set -e

supabase db reset --force
supabase db push