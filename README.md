# oversetter
Bygget for Åpen Dag @ HiOA 12. mars 2015. Dette er et kjapt *proof-of-concept* og koden bærer preg av dette. Se kjørende demo [her](https://oversetter.herokuapp.com).

## Hvordan installere?
Spinn opp på egen maskin og lag en .env-fil, eller deploy til Heroku. Følgende miljøvariabler må være satt:

+ `DEFAULT_LANGUAGE` Språket det skal oversettes fra
+ `BING_CLIENT` Klient-id'en som man identifiserer seg mot Bing med (egendefinert)
+ `BING_SECRET` Secret som du har fått fra Microsoft

Er `NODE_ENV` satt til production antar scriptet at du kjører på Heroku. Besøk [denne](https://datamarket.azure.com/dataset/bing/microsofttranslator) linken for å få credentials fra Microsoft.

## Lisens
Lisensiert under MIT-lisensen.
