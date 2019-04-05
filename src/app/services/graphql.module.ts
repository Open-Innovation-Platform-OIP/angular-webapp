import { NgModule } from '@angular/core';
import { HttpHeaders } from "@angular/common/http";
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = "https://hasura.socialalpha.jaagalabs.com/v1alpha1/graphql";
// <-- add the URL of the GraphQL server here
const authHeader = new HttpHeaders()
    .set("X-Hasura-Access-Key", "socialalpha")
    .set("Content-Type", "application/json");
export function createApollo(httpLink: HttpLink) {
  return {
    link: httpLink.create({ uri, headers: authHeader }),
    cache: new InMemoryCache(),
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink],
    },
  ],
})
export class GraphQLModule { }
