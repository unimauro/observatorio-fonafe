# -*- coding: utf-8 -*-
"""
Modelos ORM (SQLAlchemy) para PostgreSQL — Fase 1+.

Para cuando el dato deje de servirse desde JSON y se persista en Postgres.
El loader (etl -> db) se implementa en la Fase 1; estos modelos definen el esquema.
"""
from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, Date
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class Company(Base):
    __tablename__ = "companies"
    id = Column(Integer, primary_key=True)
    slug = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    acronym = Column(String)
    sector = Column(String, index=True)
    holding = Column(String)
    ruc = Column(String, index=True)
    website = Column(String)
    employees = Column(Integer)
    description = Column(String)
    financials = relationship("Financial", back_populates="company", cascade="all, delete-orphan")
    contracts = relationship("Contract", back_populates="company", cascade="all, delete-orphan")


class Financial(Base):
    __tablename__ = "financials"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    year = Column(Integer, index=True)
    revenue = Column(Float)
    net_income = Column(Float)
    ebitda = Column(Float)
    investment = Column(Float)
    budget = Column(Float)
    budget_executed = Column(Float)
    company = relationship("Company", back_populates="financials")


class Contract(Base):
    __tablename__ = "contracts"
    id = Column(Integer, primary_key=True)
    ocid = Column(String, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), index=True)
    provider = Column(String, index=True)
    amount = Column(Float)
    year = Column(Integer, index=True)
    object = Column(String)
    method = Column(String)
    company = relationship("Company", back_populates="contracts")


class Transparency(Base):
    __tablename__ = "transparency"
    id = Column(Integer, primary_key=True)
    company_id = Column(Integer, ForeignKey("companies.id"), unique=True)
    score = Column(Integer)
    financials = Column(Boolean)
    memoria = Column(Boolean)
    directory = Column(Boolean)
    budget = Column(Boolean)
