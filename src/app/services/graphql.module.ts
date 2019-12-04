import { NgModule } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { ApolloModule, APOLLO_OPTIONS } from 'apollo-angular';
import { HttpLinkModule, HttpLink } from 'apollo-angular-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const uri = 'https://sa-dev.dev.jaagalabs.com/v1/graphql'; // <-- add the URL of the GraphQL server here
export function createApollo(httpLink: HttpLink) {
  let token = '';
  const currentUser = JSON.parse(localStorage.getItem('currentUser'));
  if (currentUser) {
    token = currentUser['token'];
  }
  let headers = <HttpHeaders>{};
  if (token) {
    headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', `Bearer ${token}`);
  } else {
    headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('X-Hasura-Role', 'public');
  }
  return {
    link: httpLink.create({ uri, headers: headers }),
    cache: new InMemoryCache()
  };
}

@NgModule({
  exports: [ApolloModule, HttpLinkModule],
  providers: [
    {
      provide: APOLLO_OPTIONS,
      useFactory: createApollo,
      deps: [HttpLink]
    }
  ]
})
export class GraphQLModule {}
