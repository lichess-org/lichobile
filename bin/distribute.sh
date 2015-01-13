#!/bin/sh

tarifa build ios,android stage >/dev/null
tarifa hockeyapp version upload ios,android stage -V
