# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-25 AS build
WORKDIR /app

# Dependencies cached in their own layer so an edit to src/ doesn't re-download the world.
COPY pom.xml .
RUN mvn -B dependency:go-offline

COPY src ./src
RUN mvn -B clean package -DskipTests

# ---- Runtime stage ----
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

RUN addgroup -S collzap && adduser -S collzap -G collzap
COPY --from=build /app/target/*.jar app.jar
RUN chown collzap:collzap app.jar
USER collzap

EXPOSE 8081

HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget -q --spider http://localhost:8081/actuator/health || exit 1

# MaxRAMPercentage lets the heap scale with whatever memory limit docker-compose sets on this
# container, instead of a fixed -Xmx that either wastes a small instance or gets OOM-killed on it.
ENTRYPOINT ["sh", "-c", "java -XX:MaxRAMPercentage=75.0 -jar app.jar"]
