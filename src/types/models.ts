import type { Agent, Profile, Property, Product, VisitRequest, BuyRequest } from "./database";

export interface AgentWithProfile extends Agent {
  profiles: Profile;
}

export interface PropertyWithAgent extends Property {
  agents: AgentWithProfile;
}

export interface ProductWithAgent extends Product {
  agents: AgentWithProfile;
}

export interface VisitRequestWithProperty extends VisitRequest {
  properties: Property;
}

export interface VisitRequestWithDetails extends VisitRequest {
  properties: PropertyWithAgent;
}

export interface BuyRequestWithProduct extends BuyRequest {
  products: Product;
}

export interface BuyRequestWithDetails extends BuyRequest {
  products: ProductWithAgent;
}
